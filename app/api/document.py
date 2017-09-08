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
            self.document._startListening()
            rv = method(self, *args, **kwargs)
            toForward = self.document._stopListening()
        self.document._forwardToOthers(toForward)
        return rv
    return wrapper

class EditManager:
    def __init__(self, document):
        self.document = document
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
        self.lock = threading.RLock()
        self.editManager = None
        self.logger = logger
        self.loggerExtra = dict(subSource='document', documentID=documentId)
        self.logger.info('created document %s' % documentId)

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
            return Response(ET.tostring(self.tree.getroot()), mimetype="application/xml")

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

    def _afterCopy(self, elt):
        """Adjust element attributes (xml:id and tt:name) after a copy.
        Makes them unique. Does not insert them into the datastructures yet: the element is expected
        to be currently out-of-tree."""
        for e in elt.iter():
            id = e.get(NS_XML('id'))
            if not id: continue
            while id in self.idMap:
                match = FIND_ID_INDEX.match(id)
                if match:
                    num = int(match.group(2))
                    id = match.group(1) + '-' + str(num+1)
                else:
                    id = id + '-1'

            e.set(NS_XML('id'), id)
        # Specific to tt: events
        name = elt.get(NS_TRIGGER('name'))
        if name:
            while name in self.nameSet:
                match = FIND_NAME_INDEX.match(name)
                if match:
                    num = int(match.group(2))
                    name = match.group(1) + ' (' + str(num+1) + ')'
                else:
                    name = name + ' (1)'
            elt.set(NS_TRIGGER('name'), name)

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
    def _startListening(self):
        """Start recording edit operations."""
        assert not self.editManager
        if self.forwardHandler:
            self.editManager = EditManager(self)

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
        self.logger.debug('forward %d commands' % len(commands), extra=self.loggerExtra)
        with self.lock:
            self._startListening()
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
        self.logger.info('load xml (%d bytes)' % len(data), extra=self.loggerExtra)
        self.url = None
        root = ET.fromstring(data)
        self.tree = ET.ElementTree(root)
        self._documentLoaded()
        return ''

    @synchronized
    def load(self, url):
        self.logger.info('load: %s' % url, extra=self.loggerExtra)
        self.url = url
        fp = urllib2.urlopen(url)
        self.tree = ET.parse(fp)
        self._documentLoaded()
        return ''

    @synchronized
    def save(self, url):
        self.logger.info('save: %s' % url, extra=self.loggerExtra)
        p = urlparse.urlparse(url)
        assert p.scheme == 'file'
        filename = urllib.url2pathname(p.path)
        fp = open(filename, 'w')
        self._zapWhitespace()
        fp.write(ET.tostring(self.tree.getroot()))

    @synchronized
    def _zapWhitespace(self):
        """Temporary method: clear all non-relevant whitespace from the document before saving"""
        for e in self.tree.getroot().iter():
            if e.text:
                e.text = e.text.strip()
            if e.tail:
                e.tail = e.tail.strip()
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
    def _getElement(self, path):
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

class DocumentXml:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.logger = self.document.logger
        self.loggerExtra = dict(self.document.loggerExtra)
        self.loggerExtra['subSource'] = 'document.xml'

    @synchronized
    def paste(self, path, where, tag=None, data='', mimetype='application/x-python-object'):
        self.logger.info('paste(%s,%s,%s,...)' % (path, where, tag), extra=self.loggerExtra)
        #
        # where should it go?
        #
        element = self.document._getElement(path)
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
        self.logger.info('cut(%s)' % (path), extra=self.loggerExtra)
        element = self.document._getElement(path)
        parent = self.document._getParent(element)
        parent.remove(element)
        self.document._elementDeleted(element)
        return self.document._fromET(element, mimetype)

    @synchronized
    def get(self, path, mimetype='application/x-python-object'):
        self.logger.info('get(%s)' % (path), extra=self.loggerExtra)
        element = self.document._getElement(path)
        return self.document._fromET(element, mimetype)

    @edit
    def modifyAttributes(self, path, attrs, mimetype='application/x-python-object'):
        self.logger.info('modifyAttributes(%s, ...)' % (path), extra=self.loggerExtra)
        element = self.document._getElement(path)
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
        self.logger.info('modifyData(%s, ...)' % (path), extra=self.loggerExtra)
        element = self.document._getElement(path)
        if data == None:
            element.text = None
            element.tail = None
        else:
            element.text = data
            element.tail = None
        return self.document._getXPath(element)

    @edit
    def copy(self, path, where, sourcepath):
        self.logger.info('copy(%s, %s <- %s)' % (path, where, sourcepath), extra=self.loggerExtra)
        element = self.document._getElement(path)
        sourceElement = self.document._getElement(sourcepath)
        newElement = copy.deepcopy(sourceElement)
        self.document._afterCopy(newElement)
        # newElement._setroot(None)
        return self.paste(path, where, None, newElement)

    @edit
    def move(self, path, where, sourcepath):
        self.logger.info('move(%s, %s <- %s)' % (path, where, sourcepath), extra=self.loggerExtra)
        element = self.document._getElement(path)
        sourceElement = self.cut(sourcepath)
        # newElement._setroot(None)
        return self.paste(path, where, None, sourceElement)

class DocumentEvents:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.logger = self.document.logger
        self.loggerExtra = dict(self.document.loggerExtra)
        self.loggerExtra['subSource'] = 'document.events'

    @synchronized
    def get(self):
        exprTriggerable = './/tt:events/tl:par[@tt:name]'
        exprModifyable = './/tl:par/tl:par[@tt:name]'
        elementsTriggerable = self.tree.getroot().findall(exprTriggerable, NAMESPACES)
        elementsModifyable = self.tree.getroot().findall(exprModifyable, NAMESPACES)
        rv = []
        for elt in elementsTriggerable:
            rv.append(self._getDescription(elt, trigger=True))
        for elt in elementsModifyable:
            rv.append(self._getDescription(elt, trigger=False))
        self.logger.info('get: %d triggerable, %d modifyable' % (len(elementsTriggerable), len(elementsModifyable)), extra=self.loggerExtra)
        return rv

    @synchronized
    def _getDescription(self, elt, trigger):
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
        if NS_TRIGGER("verb") in elt.attrib:
            rv["verb"] = elt.get(NS_TRIGGER("verb"))
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

    @edit
    def trigger(self, id, parameters):
        self.logger.info('trigger(%s, ...)' % (id), extra=self.loggerExtra)
        element = self.document.idMap.get(id)

        if element is None:
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
        self.document._afterCopy(newElement)

        for par in parameters:
            path, attr, value = self._getParameter(par)
            e = newElement.find(path, NAMESPACES)

            if e is None:
                abort(400, 'No element matches XPath %s' % path)

            e.set(attr, value)

        newParent.append(newElement)
        self.document._elementAdded(newElement, newParent)

        return newElement.get(NS_XML('id'))

    @edit
    def modify(self, id, parameters):
        self.logger.info('modify(%s, ...)' % (id), extra=self.loggerExtra)
        element = self.document.idMap.get(id)

        if element is None:
            abort(404, 'No such xml:id: %s' % id)

        allElements = set()

        for par in parameters:
            path, attr, value = self._getParameter(par)
            e = element.find(path, NAMESPACES)

            if e is None:
                abort(400, 'No element matches XPath %s' % path)

            e.set(attr, value)
            allElements.add(e)

        for e in allElements:
            self.document._elementChanged(e)


class DocumentAuthoring:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.logger = self.document.logger
        self.loggerExtra = dict(self.document.loggerExtra)
        self.loggerExtra['subSource'] = 'document.authoring'


class DocumentServe:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.callbacks = set()
        self.logger = self.document.logger
        self.loggerExtra = dict(self.document.loggerExtra)
        self.loggerExtra['subSource'] = 'document.serve'

    @synchronized
    def _nextGeneration(self):
        rootElt = self.tree.getroot()
        gen = int(rootElt.get(NS_AUTH("generation"), 0))
        gen += 1
        rootElt.set(NS_AUTH("generation"), str(gen))
        return gen

    @synchronized
    def get_timeline(self):
        """Get timeline document contents (xml) for this authoring document.
        At the moment, this is actually the whole authoring document itself."""
        self.logger.info('serving timeline.xml document', extra=self.loggerExtra)
        return ET.tostring(self.tree.getroot())

    @synchronized
    def get_layout(self):
        """Get the layout document contents (json) for this authoring document.
        At the moment, the layout document JSON representation is stored in a toplevel
        au:rawLayout element. This will change when the authoring tool starts modifying the
        layout document data."""
        self.logger.info('serving layout.json document', extra=self.loggerExtra)
        rawLayoutElement = self.tree.getroot().find('.//au:rawLayout', NAMESPACES)
        if rawLayoutElement == None:
            abort(404, 'No :au:rawLayout element in document')
        return rawLayoutElement.text

    @synchronized
    def put_layout(self, layoutJSON):
        """Temporary method, stores the raw layout document data in the authoring document."""
        self.logger.info('storing layout.json document', extra=self.loggerExtra)
        rawLayoutElement = self.tree.getroot().find('.//au:rawLayout', NAMESPACES)
        if rawLayoutElement == None:
            rawLayoutElement = ET.SubElement(self.tree.getroot(), 'au:rawLayout')
        rawLayoutElement.text = layoutJSON

    def get_client(self, timeline, layout, base=None):
        self.logger.info('serving client.json document', extra=self.loggerExtra)
        if base:
            clientDocData = urllib.urlopen(base).read()
        else:
            clientDocPath = os.path.join(os.path.dirname(__file__), 'preview-client.json')
            clientDocData = open(clientDocPath).read()
        clientDoc = json.loads(clientDocData)
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
        clientDoc['mode'] = globalSettings.mode
        return json.dumps(clientDoc)

    @synchronized
    def setCallback(self, url, contextID=None):
        if contextID:
            if hasattr(self.document.loggerExtra, 'contextID'):
                self.logger.info('overriding contextID with %s' % contextID)
                self.document.loggerExtra['contextID'] = contextID
                self.loggerExtra['contextID'] = contextID
                # xxxjack should we also update other accessor objects?
        self.logger.info('setCallback(%s)' % url, extra=self.loggerExtra)
        self.callbacks.add(url)
        self.document.forwardHandler = self

    def forward(self, operations):
        self.logger.info('forward %d operations to %d callbacks' % (len(operations), len(self.callbacks)), extra=self.loggerExtra)
        gen = self._nextGeneration()
        toRemove = []
        for callback in self.callbacks:
            try:
                r = requests.put(callback, json=dict(generation=gen, operations=operations))
                r.raise_for_status()
            except requests.exceptions.RequestException:
                print 'PUT failed:', callback # xxxjack need better error message:-)
                toRemove.append(callback)
        for callback in toRemove:
            self.logger.info('removeCallback(%s)'%callback, extra=self.loggerExtra)
            self.callbacks.discard(callback)
