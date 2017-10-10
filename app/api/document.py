from flask import Response, request, abort
import urllib2
import urllib
import urlparse
import json
import copy
import xml.etree.ElementTree as ET
import re
import threading
import os
import time
import requests
import globalSettings

import logging
logger = logging.getLogger(__name__)


class NameSpace:
    def __init__(self, namespace, url):
        self.namespace = namespace
        self.url = url

    def ns(self):
        return { self.namespace : self.url }

    def __call__(self, str):
        return "{%s}%s" % (self.url, str)

    def __contains__(self, str):
        return str.startswith('{'+self.url+'}')

    def localTag(self, str):
        if str in self:
            return str[len(self.url)+2:]
        return str

NS_TIMELINE = NameSpace("tl", "http://jackjansen.nl/timelines")
NS_TIMELINE_INTERNAL = NameSpace("tls", "http://jackjansen.nl/timelines/internal")
NS_TIMELINE_CHECK = NameSpace("tlcheck", "http://jackjansen.nl/timelines/check")
NS_2IMMERSE = NameSpace("tim", "http://jackjansen.nl/2immerse")
NS_2IMMERSE_COMPONENT = NameSpace("tic", "http://jackjansen.nl/2immerse/component")
NS_XML = NameSpace("xml", "http://www.w3.org/XML/1998/namespace")
NS_TRIGGER = NameSpace("tt", "http://jackjansen.nl/2immerse/livetrigger")
NS_AUTH = NameSpace("au", "http://jackjansen.nl/2immerse/authoring")
NAMESPACES = {}
NAMESPACES.update(NS_XML.ns())
NAMESPACES.update(NS_TIMELINE.ns())
NAMESPACES.update(NS_TIMELINE_INTERNAL.ns())
NAMESPACES.update(NS_TIMELINE_CHECK.ns())
NAMESPACES.update(NS_2IMMERSE.ns())
NAMESPACES.update(NS_2IMMERSE_COMPONENT.ns())
NAMESPACES.update(NS_TRIGGER.ns())
NAMESPACES.update(NS_AUTH.ns())
for k, v in NAMESPACES.items():
    ET.register_namespace(k, v)

# regular expression to decompose xml:id fields that end in a -number
FIND_ID_INDEX=re.compile(r'(.+)-([0-9]+)')
FIND_NAME_INDEX=re.compile(r'(.+) \(([0-9]+)\)')
FIND_PATH_ATTRIBUTE=re.compile(r'(.+)/@([a-zA-Z0-9_\-.:]+)')

# Decorator: obtain self.lock during the operation
def synchronized(method):
    """Annotate a mthod to use the object lock"""
    def wrapper(self, *args, **kwargs):
        with self.lock:
            return method(self, *args, **kwargs)
    return wrapper

# Decorator: obtain self.lock during the operation, and record all edits
def edit(method):
    """Annotate a mthod to use the object lock and record the results."""
    def wrapper(self, *args, **kwargs):
        with self.lock:
            ok = self.document._startListening(method.__name__)
            if not ok:
                self.logger.error('edit(%s): another edit operation is still in progress' % method.__name__, extra=self.getLoggerExtra())
                abort(400, "Another editing operation is still in progress")
            rv = method(self, *args, **kwargs)
            toForward = self.document._stopListening()
        self.document._forwardToOthers(toForward)
        return rv
    return wrapper

class EditManager:
    def __init__(self, document, reason=None):
        self.document = document
        self.reason = reason
        self.commandList = []
        self.document.lock.acquire()

    def add(self, element, parent):
        """Called just after an element subtree has been added to its parent.
        At time of call, the element is already present in the tree."""
        content = ET.tostring(element)
        parentPos = list(parent).index(element)
        if parentPos > 0:
            prevSibling = parent[parentPos-1]
            self.commandList.append(dict(verb='add', path=self.document._getXPath(prevSibling), where='after', data=content))
        else:
            self.commandList.append(dict(verb='add', path=self.document._getXPath(parent), where='begin', data=content))

    def delete(self, element, parent):
        """Called just before an element is about to be deleted.
        At time of call, the element is still present in the tree."""
        self.commandList.append(dict(verb='delete', path=self.document._getXPath(element)))

    def change(self, elt):
        """Called when the attributes of an element have been changed."""
        self.commandList.append(dict(verb='change', path=self.document._getXPath(elt), attrs=json.dumps(elt.attrib)))

    def commit(self):
        """Close the edit manager and return its list of commands."""
        rv = self.commandList
        self.commandList = None
        self.document.lock.release()
        return rv

class Document:
    def __init__(self, documentId):
        self.documentId = documentId
        # The whole document, as an elementtree
        self.tree = None
        self.documentElement = None # Nasty trick to work around elementtree XPath incompleteness
        self.baseAdded = False # True if tim:base attribute was added by us
        # Data strcutures for mapping over the tree
        self.parentMap = None
        self.idMap = None
        self.nameSet = None
        # handlers for the different views on the document
        self.eventsHandler = None
        self.authoringHandler = None
        self.serveHandler = None
        self.forwardHandler = None
        self.xmlHandler = None
        self.remoteHandler = None
        self.lock = threading.RLock()
        self.editManager = None
        self.companionTimelineIsActive = False # Mainly for warning triggertool operator if it is not
        self.logger = logger
        self._loggerExtra = dict(subSource='document', documentID=documentId)
        self.logger.info('created document %s' % documentId)

    def getLoggerExtra(self):
        return self._loggerExtra
        
    @synchronized
    def index(self):
        if request.method == 'PUT':
            if request.data:
                self.loadXml(request.data)
                return ''
            elif 'url' in request.args:
                self.load(request.args['url'])
                return ''
        else:
            return Response(ET.tostring(self._prepareForSave()), mimetype="application/xml")

    @synchronized
    def _documentLoaded(self):
        """Creates paremtMap and idMap and various other data structures after loading a document."""
        self.parentMap = {c:p for p in self.tree.iter() for c in p}
        # Workaround for XPath nastiness in ET: it does not handle / correctly so we help it a bit.
        self.documentElement = ET.Element('')
        self.documentElement.append(self.tree.getroot())
        self.idMap = {}
        self.nameSet = set()
        for e in self.tree.iter():
            id = e.get(NS_XML('id'))
            if id:
                self.idMap[id] = e
            name = e.get(NS_TRIGGER('name'))
            if name:
                self.nameSet.add(name)
        # Add attributes and elements that we need (mainly to communicate with the preview player timeline service)
        self.tree.getroot().set(NS_TRIGGER("wantstatus"), "true")
        self._ensureId(self.tree.getroot())
        for elt in self.tree.getroot().findall('.//tt:events/..', NAMESPACES):
            elt.set(NS_TRIGGER("wantstatus"), "true")
            self._ensureId(elt)

    @synchronized
    def _ensureId(self, elt):
        """Add an xml:id to an element if it doesn't have one already"""
        id = elt.get(NS_XML("id"))
        if id: return
        id = 'ttadded'
        while id in self.idMap:
            match = FIND_ID_INDEX.match(id)
            if match:
                num = int(match.group(2))
                id = match.group(1) + '-' + str(num+1)
            else:
                id = id + '-1'
        elt.set(NS_XML("id"), id)
        self.idMap[id] = elt
        
    @synchronized
    def _elementAdded(self, elt, parent, recursive=False):
        """Updates paremtMap and idMap and various other data structures after a new element is added.
        Returns edit operation which can be forwarded to slaved documents."""
        assert not elt in self.parentMap
        self.parentMap[elt] = parent
        id = elt.get(NS_XML('id'))
        if id:
            assert not id in self.idMap
            self.idMap[id] = elt
        name = elt.get(NS_TRIGGER('name'))
        if name:
            self.nameSet.add(name)
        for ch in elt:
            self._elementAdded(ch, elt, True)
        if not recursive and self.editManager:
            self.editManager.add(elt, parent)

    @synchronized
    def _elementDeleted(self, elt, recursive=False):
        """Updates parentMap and idMap and various other data structures after an element is deleted.
        Returns edit operation which can be forwarded to slaved documents."""
        parent = self.parentMap[elt]
        if not recursive and self.editManager:
            self.editManager.delete(elt, parent)
        del self.parentMap[elt]
        assert not elt in parent
        id = elt.get(NS_XML('id'))
        if id and id in self.idMap:
            del self.idMap[id]
        # We do not remove tt:name, it may occur multiple times so we are not
        # sure it has really disappeared
        for ch in elt:
            self._elementDeleted(ch)

    @synchronized
    def _elementChanged(self, elt):
        """Called when element attributes have changed.
        Returns edit operation which can be forwarded to slaved documents."""
        if self.editManager:
            self.editManager.change(elt)

    def _afterCopy(self, elt, triggerAttributes=False):
        """Adjust element attributes (xml:id and tt:name) after a copy.
        Makes them unique. Does not insert them into the datastructures yet: the element is expected
        to be currently out-of-tree.
        Also insert a tls:state="new" attribute, to make tls:state non-empty, so the new element
        will be picked up when building the list of modifyable elements.
        """
        for e in elt.iter():
            id = e.get(NS_XML('id'))
            if not id:
                # For the outer element we always add an id
                if e == elt and triggerAttributes:
                    id = 'new'
                else:
                    continue
            while id in self.idMap:
                match = FIND_ID_INDEX.match(id)
                if match:
                    num = int(match.group(2))
                    id = match.group(1) + '-' + str(num+1)
                else:
                    id = id + '-1'

            e.set(NS_XML('id'), id)
        # Specific to tt: events
        if triggerAttributes:
            name = elt.get(NS_TRIGGER('name'), 'New')
            if name:
                while name in self.nameSet:
                    match = FIND_NAME_INDEX.match(name)
                    if match:
                        num = int(match.group(2))
                        name = match.group(1) + ' (' + str(num+1) + ')'
                    else:
                        name = name + ' (1)'
                elt.set(NS_TRIGGER('name'), name)
            # Flag the new element as being newly copied (so it'll show up in the active list)
            elt.set(NS_TIMELINE_INTERNAL("state"), "new")

    @synchronized
    def events(self):
        """Returns the events handler (after creating it if needed)"""
        if not self.eventsHandler:
            self.eventsHandler = DocumentEvents(self)
        return self.eventsHandler

    @synchronized
    def authoring(self):
        """Returns the authoring handler (after creating it if needed)"""
        if not self.authoringHandler:
            self.authoringHandler = DocumentAuthoring(self)
        return self.authoringHandler

    @synchronized
    def serve(self):
        """Returns the serve handler (after creating it if needed)"""
        if not self.serveHandler:
            self.serveHandler = DocumentServe(self)
        return self.serveHandler

    @synchronized
    def xml(self):
        """Returns the xml handler (after creating it if needed)"""
        if not self.xmlHandler:
            self.xmlHandler = DocumentXml(self)
        return self.xmlHandler

    @synchronized
    def remote(self):
        """Returns the control handler (after creating it if needed)"""
        if not self.remoteHandler:
            self.remoteHandler = DocumentRemote(self)
        return self.remoteHandler

    @synchronized
    def _startListening(self, reason=None):
        """Start recording edit operations. Returns success indicator."""
        if self.editManager:
            self.logger.warning("EditManager for %s is still active" % self.reason, extra=self.getLoggerExtra())
            return False
        if self.forwardHandler:
            self.editManager = EditManager(self, reason)
        return True

    @synchronized
    def _stopListening(self):
        commands = None
        with self.lock:
            if self.editManager:
                commands = self.editManager.commit()
                self.editManager = None
        return commands
        
    def _forwardToOthers(self, commands):
        if commands:
            assert self.forwardHandler
            self.forwardHandler.forward(commands)

    def forward(self, commands):
        self.logger.debug('forward %d commands' % len(commands), extra=self.getLoggerExtra())
        with self.lock:
            self._startListening('Document.forward()')
            for command in commands:
                cmd = command['verb']
                del command['verb']
                if cmd == 'add':
                    path = command['path']
                    where = command['where']
                    data = command['data']
                    self.xml().paste(path=path, where=where, data=data, mimetype='application/xml')
                elif cmd == 'delete':
                    path = command['path']
                    self.xml().cut(path=path)
                elif cmd == 'change':
                    path = command['path']
                    attrs = command['attrs']
                    self.xml().modifyAttributes(path=path, attrs=attrs, mimetype='application/json')
                else:
                    assert 0, 'Unknown forward() verb: %s' % cmd
            toForward = self._stopListening()
        self._forwardToOthers(toForward)

    @synchronized
    def loadXml(self, data):
        self.logger.info('load xml (%d bytes)' % len(data), extra=self.getLoggerExtra())
        self.url = None
        self.baseAdded = False
        root = ET.fromstring(data)
        self.tree = ET.ElementTree(root)
        self._documentLoaded()
        return ''

    @synchronized
    def load(self, url):
        self.logger.info('load: %s' % url, extra=self.getLoggerExtra())
        self.url = url
        self.baseAdded = False
        fp = urllib2.urlopen(url)
        self.tree = ET.parse(fp)
        self._documentLoaded()
        if not self.tree.getroot().get(NS_2IMMERSE("base")):
            self.baseAdded = True
            self.tree.getroot().set(NS_2IMMERSE("base"), self.url)
            self.logger.debug("load: added tim:base=%s" % self.url, extra=self.getLoggerExtra())
        return ''

    @synchronized
    def save(self, url):
        self.logger.info('save: %s' % url, extra=self.getLoggerExtra())
        p = urlparse.urlparse(url)
        assert p.scheme == 'file'
        filename = urllib.url2pathname(p.path)
        fp = open(filename, 'w')
        self._zapWhitespace()
        saveTree = self._prepareForSave()
        fp.write(ET.tostring(saveTree))

    @synchronized
    def _zapWhitespace(self):
        """Temporary method: clear all non-relevant whitespace from the document before saving"""
        for e in self.tree.getroot().iter():
            if e.text:
                e.text = e.text.strip()
            if e.tail:
                e.tail = e.tail.strip()
                
    def _prepareForSave(self):
        """Prepare tree for saving by removing all items we added"""
        saveTree = copy.deepcopy(self.tree.getroot())
        # Remove tim:base, if we added it
        if self.baseAdded:
            assert saveTree.get(NS_2IMMERSE("base"))
            saveTree.attrib.pop(NS_2IMMERSE("base"))
        for elt in saveTree.iter():
            # Copy tl:dur attribute from tt:_realDur
            realDur = elt.get(NS_TRIGGER("_realDur"))
            if realDur:
                elt.set(NS_2IMMERSE("dur"), realDur)
            # Remove all tt: attributes
            toRemove = []
            for attr in elt.attrib.keys():
                if attr == NS_TRIGGER("wantstatus"):
                    toRemove.append(attr)
                if attr == NS_TRIGGER("_realdur"):
                    toRemove.append(attr)
                if attr in NS_TIMELINE_INTERNAL:
                    toRemove.append(attr)
            for attr in toRemove:
                elt.attrib.pop(attr)
        # Remove any elements we inserted
        # xxxjack tbd
        return saveTree
        
    @synchronized
    def dump(self):
        return '%d elements' % self._count()

    @synchronized
    def _count(self):
        totalCount = 0
        for _ in self.tree.iter():
            totalCount += 1
        return totalCount

    @synchronized
    def _getParent(self, element):
        return self.parentMap.get(element, None)

    def _toET(self, tag, data, mimetype):
        if type(data) == ET.Element:
            # Cop-out. It's an ElementTree object already
            assert tag == None
            assert mimetype == 'application/x-python-object'
            return data
        if mimetype in {'application/x-python-object', 'application/json'}:
            if data == None:
                data = {}
            elif mimetype == 'application/json':
                data = json.loads(data)
            assert type(data) == type({})
            assert tag
            newElement = ET.Element(tag, data)
        elif mimetype == 'application/xml':
            newElement = ET.fromstring(data)
        else:
            abort(400, 'Unexpected mimetype %s' % mimetype)
        return newElement

    def _fromET(self, element, mimetype):
        """Encode an element as xml"""
        if mimetype == 'application/x-python-object':
            # assert element.getroot() == None
            return element
        elif mimetype == 'application/json':
            assert len(list(element)) == 0
            return json.dumps(element.attrib)
        elif mimetype == 'application/xml':
            return ET.tostring(element)

    @synchronized
    def _getXPath(self, elt):
        if elt is None:
            return '$unconnectedElement'
        parent = self._getParent(elt)
        if parent is None:
            return '/' + elt.tag
        index = 0
        for ch in parent:
            if ch is elt:
                break
            if ch.tag == elt.tag:
                index += 1
        rv = self._getXPath(parent) + '/' + elt.tag
        rv = rv + '[%d]' % (index+1)
        return rv

    @synchronized
    def _getElementByPath(self, path):
        if path == '/':
            # Findall implements bare / paths incorrectly
            positions = []
        elif path[:1] == '/':
            positions = self.documentElement.findall('.'+path, NAMESPACES)
        else:
            positions = self.tree.getroot().findall(path, NAMESPACES)
        if not positions:
            abort(404, 'No tree element matches XPath %s' % path)
        if len(positions) > 1:
            abort(400, 'Multiple tree elements match XPath %s' % path)
        element = positions[0]
        return element

    def _getElementByID(self, id):
        return self.idMap.get(id)
        
class DocumentXml:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.logger = self.document.logger.getChild('xml')
        
    def getLoggerExtra(self):
        return self.document.getLoggerExtra()

    @synchronized
    def paste(self, path, where, tag=None, data='', mimetype='application/x-python-object'):
        self.logger.info('paste(%s,%s,%s,...)' % (path, where, tag), extra=self.getLoggerExtra())
        #
        # where should it go?
        #
        element = self.document._getElementByPath(path)
        #
        # what should go there?
        #
        newElement = self.document._toET(tag, data, mimetype)
        #
        # Sanity checks
        #
        # assert newElement.getroot() == None
        # assert element.getroot() != None
        #
        # Insert the new element
        #
        if where == 'begin':
            element.insert(0, newElement)
            self.document._elementAdded(newElement, element)
        elif where == 'end':
            element.append(newElement)
            self.document._elementAdded(newElement, element)
        elif where == 'replace':
            element.clear()
            for k, v in newElement.items():
                element.set(k, v)
            # xxxjack this may be unsafe, replacing children....
            for e in list(newElement):
                element.append(e)
            newElement = element
            self.document._elementChanged(element)
        elif where == 'before':
            parent = self.document._getParent(element)
            assert parent != None
            pos = list(parent).index(element)
            parent.insert(pos, newElement)
            self.document._elementAdded(newElement, parent)
        elif where == 'after':
            parent = self.document._getParent(element)
            assert parent != None
            pos = list(parent).index(element)
            if pos == len(list(parent)):
                parent.append(newElement)
            else:
                parent.insert(pos+1, newElement)
            self.document._elementAdded(newElement, parent)
        else:
            abort(400, 'Unknown relative position %s' % where)
        return self.document._getXPath(newElement)

    @synchronized
    def cut(self, path, mimetype='application/x-python-object'):
        self.logger.info('cut(%s)' % (path), extra=self.getLoggerExtra())
        element = self.document._getElementByPath(path)
        parent = self.document._getParent(element)
        parent.remove(element)
        self.document._elementDeleted(element)
        return self.document._fromET(element, mimetype)

    @synchronized
    def get(self, path, mimetype='application/x-python-object'):
        self.logger.info('get(%s)' % (path), extra=self.getLoggerExtra())
        element = self.document._getElementByPath(path)
        return self.document._fromET(element, mimetype)

    @edit
    def modifyAttributes(self, path, attrs, mimetype='application/x-python-object'):
        self.logger.info('modifyAttributes(%s, ...)' % (path), extra=self.getLoggerExtra())
        element = self.document._getElementByPath(path)
        if mimetype == 'application/x-python-object':
            pass
        elif mimetype == 'application/json':
            attrs = json.loads(attrs)
        else:
            abort(400, 'Unexpected mimetype %s' % mimetype)
        assert type(attrs) == type({})
        existingAttrs = element.attrib
        for k, v in attrs.items():
            if v == None:
                if k in existingAttrs:
                    existingAttrs.pop(k)
            else:
                existingAttrs[k] = v
        rv = self.document._getXPath(element)
        self.document._elementChanged(element)
        return rv

    @synchronized
    def modifyData(self, path, data):
        self.logger.info('modifyData(%s, ...)' % (path), extra=self.getLoggerExtra())
        element = self.document._getElementByPath(path)
        if data == None:
            element.text = None
            element.tail = None
        else:
            element.text = data
            element.tail = None
        return self.document._getXPath(element)

    @edit
    def copy(self, path, where, sourcepath):
        self.logger.info('copy(%s, %s <- %s)' % (path, where, sourcepath), extra=self.getLoggerExtra())
        element = self.document._getElementByPath(path)
        # Get the original
        sourceElement = self.document._getElementByPath(sourcepath)
        # Make a deep copy
        newElement = copy.deepcopy(sourceElement)
        self.document._afterCopy(newElement)
        # newElement._setroot(None)
        return self.paste(path, where, None, newElement)

    @edit
    def move(self, path, where, sourcepath):
        self.logger.info('move(%s, %s <- %s)' % (path, where, sourcepath), extra=self.getLoggerExtra())
        element = self.document._getElementByPath(path)
        sourceElement = self.cut(sourcepath)
        # newElement._setroot(None)
        return self.paste(path, where, None, sourceElement)

class DocumentEvents:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.logger = self.document.logger.getChild('events')

    def getLoggerExtra(self):
        return self.document.getLoggerExtra()
        
    def _now(self):
        return time.time()
        
    @synchronized
    def get(self):
        """REST get command: returns list of triggerable and modifiable events to the front end UI"""
        exprTriggerable = './/tt:events/*[@tt:name]'
        exprComplete = './/tt:completeEvents/*[@tt:name]'
        exprModifyable = './/tl:par/*[@tt:name][@tls:state]'
        elementsTriggerable = self.tree.getroot().findall(exprTriggerable, NAMESPACES)
        elementsComplete = self.tree.getroot().findall(exprComplete, NAMESPACES)
        elementsModifyable = self.tree.getroot().findall(exprModifyable, NAMESPACES)
        rv = []
        for elt in elementsTriggerable + elementsComplete:
            rv.append(self._getDescription(elt, trigger=True))
        for elt in elementsModifyable:
            # Weed out events that are already finished
            if elt.get(NS_TIMELINE_INTERNAL("state")) == "finished":
                continue
            rv.append(self._getDescription(elt, trigger=False))
        self.logger.debug('get: %d triggerable, %d complete-triggerable, %d modifyable' % (len(elementsTriggerable), len(elementsComplete), len(elementsModifyable)), extra=self.getLoggerExtra())
        # See if we need to ask the timeline server for updates
        if self.document.forwardHandler and not self.document.companionTimelineIsActive:
            self.logger.debug("get: asking document for setDocumentState calls", extra=self.getLoggerExtra())
            self.document.forwardHandler.forward([])
        return rv

    @synchronized
    def _getDescription(self, elt, trigger):
        """Returns description of a triggerable or modifiable event for the front end"""
        # xxxjack should move to ElementDelegate
        parameterExpr = './tt:parameters/tt:parameter' if trigger else './tt:modparameters/tt:parameter'
        parameterElements = elt.findall(parameterExpr, NAMESPACES)
        parameters = []
        for p in parameterElements:
            pData = dict(name=p.get(NS_TRIGGER('name')), parameter=p.get(NS_TRIGGER('parameter')))
            if NS_TRIGGER('type') in p.attrib:
                pData['type'] = p.get(NS_TRIGGER('type'))
            if NS_TRIGGER('value') in p.attrib:
                pData['value'] = p.get(NS_TRIGGER('value'))
            if NS_TRIGGER('required') in p.attrib:
                required = p.get(NS_TRIGGER('required'))
                if required and required != 'false':
                    pData['required'] = True
            parameters.append(pData)
        name = elt.get(NS_TRIGGER('name'))
        idd = elt.get(NS_XML('id'))
        rv = dict(name=name, id=idd, trigger=trigger, modify=not trigger, parameters=parameters)
        if trigger and NS_TRIGGER("verb") in elt.attrib:
            rv["verb"] = elt.get(NS_TRIGGER("verb"))
        if not trigger and NS_TRIGGER("modVerb") in elt.attrib:
            rv["verb"] = elt.get(NS_TRIGGER("modVerb"))
        if NS_TRIGGER("previewUrl") in elt.attrib:
            previewUrl = elt.get(NS_TRIGGER("previewUrl"))
            if previewUrl and self.document.url:
                previewUrl = urllib.basejoin(self.document.url, previewUrl)
            if previewUrl:
                rv["previewUrl"] = previewUrl
        if NS_TRIGGER("longdesc") in elt.attrib:
            rv["longdesc"] = elt.get(NS_TRIGGER("longdesc"))
            
        return rv

    @synchronized
    def _getParameter(self, parameter):
        """For a parameter/value coming from the front end, returns what to set where"""
        # xxxjack should move to ElementDelegate
        try:
            parPath = parameter['parameter']
            parValue = parameter['value']
        except KeyError:
            abort(400, 'Missing parameter and/or value')
        match = FIND_PATH_ATTRIBUTE.match(parPath)
        if not match:
            abort(400, 'Unsupported parameter XPath: %s' % parPath)

        path = match.group(1)
        attr = match.group(2)

        if ':' in attr:
            ns, rest = attr.split(':')
            namespace = NAMESPACES[ns]
            attr = '{%s}%s' % (namespace, rest)

        return path, attr, parValue

    @synchronized
    def _minimalAVT(self, value, contextElement, parentElement=None):
        """Handle computed values"""
        if value[:1] != "{" or value[-1:] != "}":
            return value
        expr = value[1:-1]
        if expr == "tt:clock(.)":
            return self._getClock(contextElement)
        if expr == "tt:clock(..)":
            if parentElement is None:
                parentElement = self.document._getParent(contextElement)
            return self._getClock(parentElement)
        self.logger.error("Unexpected AVT: %s" % value, extra=self.getLoggerExtra())
        return value
        
    @synchronized
    def _getClock(self, element):
        """Return current clock value for an element"""
        self.logger.debug("getClock(%s)" % self.document._getXPath(element), extra=self.getLoggerExtra())

        epoch = element.get(NS_TIMELINE_INTERNAL("epoch"))
        if epoch != None:
            curTime = self._now() - float(epoch)
            self.logger.debug("getClock(%s) = %f" % (self.document._getXPath(element), curTime), extra=self.getLoggerExtra())
            return str(curTime)
        self.logger.warning("getClock: %s has no tls:epoch, returning 0" % self.document._getXPath(element), extra=self.getLoggerExtra())
        return "0"
        
    @edit
    def trigger(self, id, parameters):
        """REST trigger command: triggers an event"""
        self.logger.info('trigger(%s, %s)' % (id, repr(parameters)), extra=self.getLoggerExtra())
        element = self.document.idMap.get(id)

        if element is None:
            self.logger.error("trigger: no such xml:id: %s" % id, extra=self.getLoggerExtra())
            abort(404, 'No such xml:id: %s' % id)

        if False:
            # Cannot get above starting point with elementTree:-(
            newParentPath = element.get(NS_TRIGGER('target'), '..')
            newParent = element.find(newParentPath)
        else:
            tmp = self.document._getParent(element)
            newParent = self.document._getParent(tmp)

        assert newParent is not None

        newElement = copy.deepcopy(element)
        newElement.set(NS_TRIGGER("wantstatus"), "true")
        self.document._afterCopy(newElement, triggerAttributes=True)

        for par in parameters:
            path, attr, value = self._getParameter(par)
            e = newElement.find(path, NAMESPACES)

            value = self._minimalAVT(value, newElement, newParent)

            if e is None:
                abort(400, 'No element matches XPath %s' % path)

            e.set(attr, value)

        newParent.append(newElement)
        self.document._elementAdded(newElement, newParent)
        
        self.document.companionTimelineIsActive = False
        return newElement.get(NS_XML('id'))

    @edit
    def modify(self, id, parameters):
        """REST modify command: modifies a running event"""
        self.logger.info('modify(%s, ...)' % (id), extra=self.getLoggerExtra())
        element = self.document.idMap.get(id)

        if element is None:
            abort(404, 'No such xml:id: %s' % id)

        allElements = set()

        for par in parameters:
            path, attr, value = self._getParameter(par)
            e = element.find(path, NAMESPACES)

            value = self._minimalAVT(value, element)

            if e is None:
                abort(400, 'No element matches XPath %s' % path)

            e.set(attr, value)
            allElements.add(e)

        for e in allElements:
            self.document._elementChanged(e)

        self.document.companionTimelineIsActive = False
        return ""

        
class DocumentRemote:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.logger = self.document.logger.getChild('remote')
        
    def getLoggerExtra(self):
        return self.document.getLoggerExtra()
        
    @synchronized
    def get(self):
        rv = dict(status='Preview player may be running', active=False)
        return rv
        
    @synchronized
    def control(self, command):
        if type(command) != type({}):
            abort(400, 'remote/control requires JSON object')
        if 'position' in command:
            position = command.get('position')
            self.logger.warning('position=%f not implemented yet' % position, extra=self.getLoggerExtra())
        if 'adjust' in command:
            adjust = command.get('adjust')
            self.logger.warning('adjust=%f not implemented yet' % adjust, extra=self.getLoggerExtra())
        if 'playing' in command:
            playing = command.get('playing')
            self.logger.warning('playing=%s not implemented yet' % playing, extra=self.getLoggerExtra())
        return ""

class DocumentAuthoring:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.logger = self.document.logger.getChild('authoring')
        
    def getLoggerExtra(self):
        return self.document.getLoggerExtra()

class DocumentServe:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.callbacks = set()
        self.logger = self.document.logger.getChild('serve')

    def getLoggerExtra(self):
        return self.document.getLoggerExtra()
        
    def _now(self):
        return time.time()
        
    @synchronized
    def _nextGeneration(self, sameValue):
        rootElt = self.tree.getroot()
        gen = int(rootElt.get(NS_AUTH("generation"), 0))
        if not sameValue:
            gen += 1
        rootElt.set(NS_AUTH("generation"), str(gen))
        return gen

    @synchronized
    def get_timeline(self):
        """Get timeline document contents (xml) for this authoring document.
        At the moment, this is actually the whole authoring document itself."""
        self.logger.info('serving timeline.xml document', extra=self.getLoggerExtra())
        return ET.tostring(self.tree.getroot())

    @synchronized
    def get_layout(self):
        """Get the layout document contents (json) for this authoring document.
        At the moment, the layout document JSON representation is stored in a toplevel
        au:rawLayout element. This will change when the authoring tool starts modifying the
        layout document data."""
        self.logger.info('serving layout.json document', extra=self.getLoggerExtra())
        rawLayoutElement = self.tree.getroot().find('.//au:rawLayout', NAMESPACES)
        if rawLayoutElement == None:
            abort(404, 'No :au:rawLayout element in document')
        return rawLayoutElement.text

    @synchronized
    def put_layout(self, layoutJSON):
        """Temporary method, stores the raw layout document data in the authoring document."""
        self.logger.info('storing layout.json document', extra=self.getLoggerExtra())
        rawLayoutElement = self.tree.getroot().find('.//au:rawLayout', NAMESPACES)
        if rawLayoutElement == None:
            rawLayoutElement = ET.SubElement(self.tree.getroot(), 'au:rawLayout')
        rawLayoutElement.text = layoutJSON

    def get_client(self, timeline, layout, base=None):
        """Return the client.api document that describes this dmapp"""
        self.logger.info('serving client.json document', extra=self.getLoggerExtra())
        if base:
            clientDocData = urllib.urlopen(base).read()
        else:
            clientDocPath = os.path.join(os.path.dirname(__file__), 'preview-client.json')
            clientDocData = open(clientDocPath).read()
        clientDoc = json.loads(clientDocData)
        #
        # Next we override from the document (if overrides are present)
        #
        clientExtraElement = self.tree.getroot().find('.//au:rawClient', NAMESPACES)
        if clientExtraElement != None and clientExtraElement.text:
            clientExtra = json.loads(clientExtraElement.text)
            for k, v in clientExtra.items():
                clientDoc[k] = v
        # 
        # We do substitution manually, for now. May want to use a templating system at some point.
        #
        clientDoc['serviceInput'] = dict(
                layout=layout,
                timeline=timeline,
                )
        clientDoc['serviceUrls'] = dict(
                layoutService=globalSettings.layoutService,
                websocketService=globalSettings.websocketService,
                timelineService=globalSettings.timelineService,
                )
        # Note that this should be user-settable, depending on this flag the preview will run
        # in single-device (standalone) or TV mode.
        clientDoc['mode'] = globalSettings.mode
        
        return json.dumps(clientDoc)

    @synchronized
    def put_client(self, clientJSON):
        """Temporary method, store per-dmapp client.json settings in the authoring document"""
        self.logger.info('storing additions to client.json document', extra=self.getLoggerExtra())
        rawClientElement = self.tree.getroot().find('.//au:rawClient', NAMESPACES)
        if rawClientElement == None:
            rawClientElement = ET.SubElement(self.tree.getroot(), 'au:rawClient')
        rawClientElement.text = layoutJSON

    @synchronized
    def setCallback(self, url, contextID=None):
        if contextID:
                self.logger.info('overriding contextID with %s' % contextID)
                self.document._loggerExtra['contextID'] = contextID
        self.logger.info('setCallback(%s, %s)' % (url, contextID), extra=self.getLoggerExtra())
        self.callbacks.add(url)
        self.document.forwardHandler = self

    @synchronized
    def setDocumentState(self, documentState):
        self.logger.debug("setDocumentState: got %d element-state items" % len(documentState), extra=self.getLoggerExtra())
        self.document.companionTimelineIsActive = True
        for eltId, eltState in documentState.items():
            elt = self.document._getElementByID(eltId)
            if not elt:
                self.logger.warning('setDocumentState: unknown element %s' % eltId, extra=self.getLoggerExtra())
                continue
            changed = self._elementStateChanged(elt, eltState)
            if changed:
                self.logger.debug("setDocumentState: %s: changed" % eltId, extra=self.getLoggerExtra())
                
    def _elementStateChanged(self, elt, eltState):
        """Timeline service has sent new state for this element. Return True if anything has changed."""
        newState = eltState[NS_TIMELINE_INTERNAL("state")]
        if newState == 'idle':
            newState = None
        newProgress = eltState[NS_TIMELINE_INTERNAL("progress")]
        if newProgress:
            newEpoch = self._now() - float(newProgress)
        else:
            newEpoch = None
        oldState = elt.get(NS_TIMELINE_INTERNAL("state"))
        oldEpoch = elt.get(NS_TIMELINE_INTERNAL("epoch"))
        if oldEpoch:
            oldEpoch = float(oldEpoch)
        def almostEqual(t1, t2):
            if not t1 and not t2:
                return True
            if not t1 or not t2:
                return t1 == t2
            return abs(t1-t2) < 0.1
        if oldState == newState and almostEqual(oldEpoch, newEpoch):
            return False
        self.logger.debug("eltStateChanged(%s): state=%s epoch=%s" % (self.document._getXPath(elt), newState, newEpoch), extra=self.getLoggerExtra())
        if newState:
            elt.set(NS_TIMELINE_INTERNAL("state"), newState)
        else:
            elt.attrib.pop(NS_TIMELINE_INTERNAL("state"))
        if newEpoch:
            elt.set(NS_TIMELINE_INTERNAL("epoch"), str(newEpoch))
        elif NS_TIMELINE_INTERNAL("epoch") in elt.attrib:
            elt.attrib.pop(NS_TIMELINE_INTERNAL("epoch"))
        return True
         
    def forward(self, operations):
        if len(operations) and len(self.callbacks):
            self.logger.info('forward %d operations to %d callbacks' % (len(operations), len(self.callbacks)), extra=self.getLoggerExtra())
        else:
            self.logger.debug('forward %d operations to %d callbacks' % (len(operations), len(self.callbacks)), extra=self.getLoggerExtra())
        gen = self._nextGeneration(not operations)
        toRemove = []
        wantStateUpdates = True
        for callback in self.callbacks:
            try:
                requestStartTime = time.time() # Debugging: sometimes requests take a very long time
                args = dict(generation=gen, operations=operations)
                # for the first successful one, add updateState=True
                if wantStateUpdates:
                    args['wantStateUpdates'] = True
                r = requests.put(callback, json=args)
                r.raise_for_status()
                wantStateUpdates = False
            except requests.exceptions.RequestException:
                self.logger.warning("forward: PUT failed for %s" % callback, extra=self.getLoggerExtra())
                toRemove.append(callback)
            else:
                requestDuration = time.time() - requestStartTime
                if requestDuration > 2:
                    self.logger.warning("forward: PUT took %d seconds for %s" % (requestDuration, callback), extra=self.getLoggerExtra())
                    
            # Only continue if we have anything to say...
            if not operations and not wantStateUpdates:
                break
        for callback in toRemove:
            self.logger.info('removeCallback(%s)'%callback, extra=self.getLoggerExtra())
            self.callbacks.discard(callback)
