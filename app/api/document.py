from flask import Response, request, abort
from socketIO_client import SocketIO, SocketIONamespace
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
from globalSettings import GlobalSettings
import clocks

import logging
logger = logging.getLogger(__name__)

# Pattern to find AVT-like interpolation expressions
INTERPOLATION = re.compile(r'\{[^}]+\}')

OLD_EVENT_PARAMETERS = True
NEW_EVENT_PARAMETERS = True


class NameSpace:
    def __init__(self, namespace, url):
        self.namespace = namespace
        self.url = url

    def ns(self):
        return {self.namespace: self.url}

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
FIND_ID_INDEX = re.compile(r'(.+)-([0-9]+)')
FIND_NAME_INDEX = re.compile(r'(.+) \(([0-9]+)\)')
FIND_PATH_ATTRIBUTE = re.compile(r'(.+)/@([a-zA-Z0-9_\-.:]+)')


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
                self.document.setError("Another editing operation is still in progress")
                abort(400, "Another editing operation is still in progress")
            toForward = None
            try:
                rv = method(self, *args, **kwargs)
            finally:
                toForward = self.document._stopListening()
        if toForward:
            self.document._forwardToOthers(toForward)
        return rv
    return wrapper


class EditManager:
    """Helper class to collect sets of operations, sort of a simplified transaction mechanism"""
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
        self.testMode = False
        self.tree = None
        self.url = None
        self.base = None
        self.documentElement = None  # Nasty trick to work around elementtree XPath incompleteness
        self.baseAdded = False  # True if tim:base attribute was added by us
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
        self.settingsHandler = None
        self.asyncHandler = None
        self.lock = threading.RLock()
        self.editManager = None
        self.companionTimelineIsActive = False  # Mainly for warning triggertool operator if it is not
        self.lastErrorMessage = None
        self.logger = logger
        self.timeOpened = time.time()
        self.description = ''
        self._setDescription()
        self.clock = clocks.PausableClock(clocks.SystemClock())
        self._loggerExtra = dict(subSource='document', documentID=documentId)
        self.logger.info('created document %s' % documentId)

    def getLoggerExtra(self):
        return self._loggerExtra

    def clearError(self):
        self.lastErrorMessage = None

    def setError(self, msg):
        self.lastErrorMessage = msg

    def setTestMode(self, mode):
        self.testMode = mode

    def _setDescription(self):
        rv = str(self.documentId)
        rv += time.strftime(", %d-%b-%y %H:%M UTC", time.gmtime(self.timeOpened))
        if self.url:
            rv += ', ' + self.url
        self.description = rv

    def getDescription(self):
        return "%s (%s)" % (self.description, str(self.documentId))

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
        self.parentMap = {c: p for p in self.tree.iter() for c in p}
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
        firstRootChild = list(self.tree.getroot())[0]
        firstRootChild.set(NS_TRIGGER("wantstatus"), "true")
        self._ensureId(firstRootChild)
        self._ensureId(self.tree.getroot())
        for elt in self.tree.getroot().findall('.//tt:events/..', NAMESPACES):
            elt.set(NS_TRIGGER("wantstatus"), "true")
            self._ensureId(elt)

    @synchronized
    def _ensureId(self, elt):
        """Add an xml:id to an element if it doesn't have one already"""
        id = elt.get(NS_XML("id"))
        if id:
            return
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
        assert elt not in self.parentMap
        self.parentMap[elt] = parent
        id = elt.get(NS_XML('id'))
        if id:
            assert id not in self.idMap
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
        assert elt not in parent
        id = elt.get(NS_XML('id'))
        if id and id in self.idMap:
            del self.idMap[id]
        # We do not remove tt:name, it may occur multiple times so we are not
        # sure it has really disappeared
        toDelete = [ch for ch in elt]

        for ch in toDelete:
            elt.remove(ch)
            self._elementDeleted(ch, recursive=True)

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
        """Returns the remote control handler (after creating it if needed)"""
        if not self.remoteHandler:
            self.remoteHandler = DocumentRemote(self)
        return self.remoteHandler

    @synchronized
    def settings(self):
        """Returns the asynchronous (socketIO) update handler (after creating it if needed)"""
        if not self.settingsHandler:
            self.settingsHandler = DocumentSettings(self)
        return self.settingsHandler

    @synchronized
    def async(self):
        """Returns the document settings handler (after creating it if needed)"""
        if not self.asyncHandler:
            self.asyncHandler = DocumentAsync(self)
        return self.asyncHandler

    @synchronized
    def _startListening(self, reason=None):
        """Start recording edit operations. Returns success indicator."""
        if self.editManager:
            self.logger.warning("EditManager for %s is still active" % self.editManager.reason, extra=self.getLoggerExtra())
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
        self.base = None
        self.baseAdded = False
        try:
            root = ET.fromstring(data)
        except ET.ParseError:
            self.setError("XML parse error in document")
            abort(400, "XML parse error in document")
        self.tree = ET.ElementTree(root)
        self._documentLoaded()
        if self.tree.getroot().get(NS_2IMMERSE("base")):
            self.base = self.tree.getroot().get(NS_2IMMERSE("base"))
        return ''

    @synchronized
    def load(self, url):
        self.logger.info('load: %s' % url, extra=self.getLoggerExtra())
        self.url = url
        self.base = None
        self.baseAdded = False
        fp = urllib2.urlopen(url)
        try:
            self.tree = ET.parse(fp)
        except ET.ParseError:
            self.setError("XML parse error in document")
            abort(400, "XML parse error in %s" % url)
        self._documentLoaded()
        if self.tree.getroot().get(NS_2IMMERSE("base")):
            self.base = self.tree.getroot().get(NS_2IMMERSE("base"))
        else:
            self.base = self.url
            self.baseAdded = True
            self.tree.getroot().set(NS_2IMMERSE("base"), self.url)
            self.logger.debug("load: added tim:base=%s" % self.url, extra=self.getLoggerExtra())
        self.clearError()
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
        self.clearError()

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
                elt.set(NS_TIMELINE("dur"), realDur)
            # Remove all tt: attributes
            toRemove = []
            for attr in elt.attrib.keys():
                if attr == NS_TRIGGER("_realDur"):
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
        if isinstance(data, ET.Element):
            # Cop-out. It's an ElementTree object already
            assert tag is None
            assert mimetype == 'application/x-python-object'
            return data
        if mimetype in {'application/x-python-object', 'application/json'}:
            if data is None:
                data = {}
            elif mimetype == 'application/json':
                data = json.loads(data)
            assert isinstance(data, dict)
            assert tag
            newElement = ET.Element(tag, data)
        elif mimetype == 'application/xml':
            newElement = ET.fromstring(data)
        else:
            self.setError("Internal error: unexpected mimetype %s" % mimetype)
            abort(400, 'Unexpected mimetype %s' % mimetype)
        return newElement

    def _fromET(self, element, mimetype):
        """Encode an element as xml"""
        if mimetype == 'application/x-python-object':
            # assert element.getroot() is None
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
            self.setError('No XML element matches XPath %s' % path)
            abort(404, 'No tree element matches XPath %s' % path)
        if len(positions) > 1:
            self.setError('Multiple XML elements match XPath %s' % path)
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
        # assert newElement.getroot() is None
        # assert element.getroot() is not None
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
            assert parent is not None
            pos = list(parent).index(element)
            parent.insert(pos, newElement)
            self.document._elementAdded(newElement, parent)
        elif where == 'after':
            parent = self.document._getParent(element)
            assert parent is not None
            pos = list(parent).index(element)
            if pos == len(list(parent)):
                parent.append(newElement)
            else:
                parent.insert(pos+1, newElement)
            self.document._elementAdded(newElement, parent)
        else:
            self.document.setError('Internal error: unknown relative position %s' % where)
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
            self.document.setError('Internal error: unexpected mimetype %s' % mimetype)
            abort(400, 'Unexpected mimetype %s' % mimetype)
        assert isinstance(attrs, dict)
        existingAttrs = element.attrib
        for k, v in attrs.items():
            if v is None:
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
        if data is None:
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

    def _documentError(self, message):
        """Error in document. Report to trigger tool user as well as to the log"""
        self.document.setError(message)
        self.logger.error(message, extra=self.getLoggerExtra())
        abort(400, message)

    @synchronized
    def get(self, caller='get'):
        """REST get command: returns list of triggerable and modifiable events to the front end UI"""
        exprTriggerable = './/tt:events/*[@tt:name]'
        exprComplete = './/tt:completeEvents/*[@tt:name]'
        exprModifyable = './/tl:par/*[@tt:name][@tls:state]'
        elementsTriggerable = self.tree.getroot().findall(exprTriggerable, NAMESPACES)
        elementsComplete = self.tree.getroot().findall(exprComplete, NAMESPACES)
        elementsModifyable = self.tree.getroot().findall(exprModifyable, NAMESPACES)
        eventList = []
        for elt in elementsTriggerable:
            eventList.append(self._getDescription(elt, trigger=True, state='abstract'))
        for elt in elementsComplete:
            eventList.append(self._getDescription(elt, trigger=True, state='ready'))
        for elt in elementsModifyable:
            # Weed out events that are already finished
            if elt.get(NS_TIMELINE_INTERNAL("state")) == "finished":
                continue
            eventList.append(self._getDescription(elt, trigger=False, state='active'))
        self.logger.debug('%s: %d triggerable, %d complete-triggerable, %d modifyable' % (caller, len(elementsTriggerable), len(elementsComplete), len(elementsModifyable)), extra=self.getLoggerExtra())

        rv = {
            "remote": self.document.remote().get(),
            "events": eventList
        }
        return rv

    @synchronized
    def _getDescription(self, elt, trigger, state=None):
        """Returns description of a triggerable or modifiable event for the front end"""
        # xxxjack should move to ElementDelegate
        if state == 'abstract':
            parameterExpr = './tt:parameters/tt:parameter'
        elif state == 'ready':
            parameterExpr = './tt:readyparameters/tt:parameter'
        elif state == 'active':
            parameterExpr = './tt:modparameters/tt:parameter'
        else:
            assert 0
        parameterElements = elt.findall(parameterExpr, NAMESPACES)
        parameters = []
        #
        # Collect information about each individual parameter
        #
        for paramElt in parameterElements:
            pData = dict(name=paramElt.get(NS_TRIGGER('name')))
            parameter = paramElt.get(NS_TRIGGER('parameter'))
            if parameter:
                #
                # If tt:parameter is set this parameter has a single location to store the parameter
                #
                match = FIND_PATH_ATTRIBUTE.match(parameter)
                if not match:
                    self._documentError('Event tt:parameter XPath does not refer to an attribute: %s' % parPath)
                pData['parameter'] = parameter
            else:
                #
                # Multiple locations to store the parameter. Pass XPath of the tt:parameter element itself in stead
                # and trigger/modify will handle it.
                #
                pData['parameter'] = self.document._getXPath(paramElt)
            if NS_TRIGGER('type') in paramElt.attrib:
                pData['type'] = paramElt.get(NS_TRIGGER('type'))
            if NS_TRIGGER('value') in paramElt.attrib:
                pData['value'] = paramElt.get(NS_TRIGGER('value'))
            if NS_TRIGGER('required') in paramElt.attrib:
                required = paramElt.get(NS_TRIGGER('required'))
                if required and required != 'false':
                    pData['required'] = True
            #
            # Find all menu options (if any)
            #
            if NS_TRIGGER('optionListId') in paramElt.attrib:
                # Get indirectly (probably from an au:assetList)
                optionListId = paramElt.get(NS_TRIGGER('optionListId'))
                optionListElt = self.document._getElementByID(optionListId)
                if optionListElt is None:
                    self._documentError('tt:parameter optionListId does not exist: %s' % optionListId)
                optionValues = self._getOptions(optionListElt)
                # self.logger.debug('_getDescription: got %d selection options from element %s' % (len(optionValues), optionListId), extra=self.getLoggerExtra())
            else:
                optionValues = self._getOptions(paramElt)
                # self.logger.debug('_getDescription: got %d selection options from self' % len(optionValues), extra=self.getLoggerExtra())
            if optionValues:
                pData['options'] = optionValues
            if pData.get('type') == 'selection' and not pData.get('options'):
                self.logger.warn('tt:parameter with type=selection but no options to select', extra=self.getLoggerExtra())
                self.document.setError('tt:parameter with type=selection but no options to select')

            #
            # Append all data on this parameter to the list of all parameters
            #
            parameters.append(pData)
        #
        # Collect information about the event as a whole
        #
        name = elt.get(NS_TRIGGER('name'))
        idd = elt.get(NS_XML('id'))
        rv = dict(name=name, id=idd, trigger=trigger, modify=not trigger, parameters=parameters)
        if OLD_EVENT_PARAMETERS:
            rv['trigger'] = trigger
            rv['modify'] = not trigger
        if NEW_EVENT_PARAMETERS and state:
            rv['state'] = state
        if trigger and NS_TRIGGER("verb") in elt.attrib:
            rv["verb"] = elt.get(NS_TRIGGER("verb"))
        if not trigger and NS_TRIGGER("modVerb") in elt.attrib:
            rv["verb"] = elt.get(NS_TRIGGER("modVerb"))
        if NS_TRIGGER("previewUrl") in elt.attrib:
            previewUrl = elt.get(NS_TRIGGER("previewUrl"))
            if previewUrl and self.document.base:
                previewUrl = urllib.basejoin(self.document.base, previewUrl)
            if previewUrl:
                rv["previewUrl"] = previewUrl
        if NS_TRIGGER("longdesc") in elt.attrib:
            rv["longdesc"] = elt.get(NS_TRIGGER("longdesc"))
        rv["productionId"] = elt.get(NS_TRIGGER("productionId"), idd)
        rv["productionGroup"] = elt.get(NS_TRIGGER("productionGroup"), rv["productionId"])

        return rv

    @synchronized
    def _getOptions(self, optionListElt):
        optionElements = optionListElt.findall('./au:item', NAMESPACES)
        optionValues = []

        for optionElt in optionElements:
            optionValues.append({
                "label": optionElt.get(NS_AUTH("label")),
                "value": optionElt.get(NS_AUTH("value"))
            })
        return optionValues

    @synchronized
    def _getParameterDestinations(self, parameter):
        """For a parameter/value coming from the front end, returns what to set where"""
        # xxxjack should move to ElementDelegate
        try:
            parPath = parameter['parameter']
            parValue = parameter['value']
        except KeyError:
            self._documentError('Missing parameter and/or value in event')
        if '@' in parPath:
            # The XPath has an attribute designator. Assume it's the final destination XPath.
            path, attr = self._splitXPath(parPath)
            return [(path, attr, parValue)]
        # The XPath has no attribute designator, assume it's a node XPath and collect the
        # tt:destination children there.
        elt = self.document._getElementByPath(parPath)
        if elt is None:
            self._documentError('XPath in parameter does not refer to existing element')
        destElements = elt.findall('./tt:destination', NAMESPACES)
        rv = []
        for dElt in destElements:
            dXPath = dElt.get(NS_TRIGGER("parameter"))
            dValue = dElt.get(NS_TRIGGER("value"))
            dPath, dAttr = self._splitXPath(dXPath)
            rv.append((dPath, dAttr, dValue))
        return rv

    def _splitXPath(self, parPath):
        """Split off the attribute bit of an xpath"""
        match = FIND_PATH_ATTRIBUTE.match(parPath)
        if not match:
            self._documentError('Event tt:parameter XPath does not refer to an attribute: %s' % parPath)

        path = match.group(1)
        attr = match.group(2)

        if ':' in attr:
            ns, rest = attr.split(':')
            namespace = NAMESPACES[ns]
            attr = '{%s}%s' % (namespace, rest)

        return path, attr

    @synchronized
    def _minimalAVT(self, value, userValue, contextElement, parentElement=None):
        """Handle computed values"""
        match = INTERPOLATION.search(value)
        if not match:
            return value
        expr = value[match.start()+1:match.end()-1]
        if expr == "tt:clock(.)":
            exprValue = self._getClock(contextElement)
        elif expr == "tt:clock(..)":
            if parentElement is None:
                parentElement = self.document._getParent(contextElement)
            exprValue = self._getClock(parentElement)
        elif expr == "tt:value()":
            exprValue = userValue
        else:
            # Presume it is an XPath expression leading to a variable in the document.
            matchedElements = self.tree.getroot().findall(expr, NAMESPACES)
            if matchedElements:
                v = ''
                for e in matchedElements:
                    if e.text:
                        v += e.text.strip()
                    if e.tail:
                        v += e.tail.strip()
                exprValue = v
            else:
                self.logger.error("Unexpected AVT: %s" % value, extra=self.getLoggerExtra())
                exprValue = "{" + expr + "}"

        exprValue = str(exprValue)
        value = value[:match.start()] + exprValue + value[match.end():]
        return value

    @synchronized
    def _getClock(self, element):
        """Return current clock value for an element"""

        epoch = element.get(NS_TIMELINE_INTERNAL("epoch"))
        if epoch is not None:
            curTime = self.document.clock.now() - float(epoch)
            self.logger.debug("getClock(%s) = %f" % (self.document._getXPath(element), curTime), extra=self.getLoggerExtra())
            return str(curTime)
        self.logger.debug("getClock: %s has no tls:epoch, returning 0" % self.document._getXPath(element), extra=self.getLoggerExtra())
        # self.document.setError("Clock for %s used, but it is not running."%self.document._getXPath(element))
        return "0"

    @edit
    def trigger(self, id, parameters):
        """REST trigger command: triggers an event"""
        self.logger.info('trigger(%s, %s)' % (id, repr(parameters)), extra=self.getLoggerExtra())
        element = self.document.idMap.get(id)

        if element is None:
            self.logger.error("trigger: no such xml:id: %s" % id, extra=self.getLoggerExtra())
            self.document.setError('No such xml:id: %s' % id)
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
            parValue = par['value']
            for path, attr, value in self._getParameterDestinations(par):
                e = newElement.find(path, NAMESPACES)

                value = self._minimalAVT(value, parValue, newElement, newParent)

                if e is None:
                    self._documentError("No element matches XPath %s" % path)

                e.set(attr, value)

        newParent.append(newElement)
        self.document._elementAdded(newElement, newParent)

        self.document.companionTimelineIsActive = False
        self.document.clearError()
        self.document.async().requestBroadcastToFrontends()
        return newElement.get(NS_XML('id'))

    @edit
    def enqueue(self, id, parameters):
        """REST trigger command: copies an abstract event with all parameters filled in on the ready list"""
        self.logger.info('enqueue(%s, %s)' % (id, repr(parameters)), extra=self.getLoggerExtra())
        element = self.document.idMap.get(id)

        if element is None:
            self.logger.error("enqueue: no such xml:id: %s" % id, extra=self.getLoggerExtra())
            self.document.setError('No such xml:id: %s' % id)
            abort(404, 'No such xml:id: %s' % id)

        if False:
            # Cannot get above starting point with elementTree:-(
            newParentPath = element.get(NS_TRIGGER('target'), '..')
            newParent = element.find(newParentPath)
        else:
            tmp = self.document._getParent(element)
            tmp2 = self.document._getParent(tmp)
            allComplete = tmp2.findall('./tt:completeEvents', NAMESPACES)
            if len(allComplete) != 1:
                self.logger.error("enqueue: %d tt:completeEvents in %s" % (len(allComplete), self.document._getXPath(tmp2)))
                self.document.setError("enqueue: %d tt:completeEvents in %s" % (len(allComplete), self.document._getXPath(tmp2)))
                abort(404, "enqueue: %d tt:completeEvents in %s" % (len(allComplete), self.document._getXPath(tmp2)))
            newParent = allComplete[0]

        assert newParent is not None

        newElement = copy.deepcopy(element)
        newElement.set(NS_TRIGGER("wantstatus"), "true")
        self.document._afterCopy(newElement, triggerAttributes=True)
        # The new element should have a productionId (which is used to combine multiple instances of the event
        # in the UI). Invent one if needed, and record we should remove references after it becomes inactive
        if not NS_TRIGGER("productionId") in newElement:
            newElement.set(NS_TRIGGER("productionId"), newElement.get(NS_XML("id")))
            newElement.set(NS_TRIGGER("productionIdTransient"), "true")
            newElement.set(NS_TRIGGER("productionParent"), id)

        for par in parameters:
            parValue = par['value']
            for path, attr, value in self._getParameterDestinations(par):
                e = newElement.find(path, NAMESPACES)

                value = self._minimalAVT(value, parValue, newElement, newParent)

                if e is None:
                    self._documentError("No element matches XPath %s" % path)

                e.set(attr, value)

        newParent.append(newElement)
        self.document._elementAdded(newElement, newParent)

        self.document.companionTimelineIsActive = False
        self.document.clearError()
        self.document.async().requestBroadcastToFrontends()
        return newElement.get(NS_XML('id'))

    @edit
    def dequeue(self, id):
        """ Drop the event with the given id from the list of queued events """
        element = self.document.idMap.get(id)

        if element is None:
            return True

        parent = self.document._getParent(element)

        assert parent is not None
        # xxxjack don't like this, should ensure parentmap is updated
        try:
            parent.remove(element)
        except:
            pass
        self.document.async().requestBroadcastToFrontends()
        return True

    @edit
    def modify(self, id, parameters):
        """REST modify command: modifies a running event"""
        self.logger.info('modify(%s, ...)' % (id), extra=self.getLoggerExtra())
        element = self.document.idMap.get(id)

        if element is None:
            self.logger.error("modify: no such xml:id: %s" % id, extra=self.getLoggerExtra())
            self.document.setError("No such xml:id: %s" % id)
            abort(404, 'No such xml:id: %s' % id)

        allElements = set()

        for par in parameters:
            parValue = par['value']
            for path, attr, value in self._getParameterDestinations(par):
                e = element.find(path, NAMESPACES)

                value = self._minimalAVT(value, parValue, element)

                if e is None:
                    self._documentError('No element matches XPath %s' % path)

                e.set(attr, value)
                allElements.add(e)

        for e in allElements:
            self.document._elementChanged(e)

        self.document.companionTimelineIsActive = False
        self.document.clearError()

        return ""

    def _productionIdFinished(self, productionId):
        """Called when a transient productionId has finished running. Remove from completeEvents"""
        events = self.tree.getroot().findall(".//tt:completeEvents/*[@tt:productionId='%s']" % productionId, NAMESPACES)
        self.logger.info("productionIdFinished(%s): removing %d events" % (productionId, len(events)))
        for elt in events[:1]:
            parent = self.document._getParent(elt)
            parent.remove(elt)
            self.document._elementDeleted(elt)


class DocumentRemote:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        self.lock = self.document.lock
        self.logger = self.document.logger.getChild('remote')
        self.statusElement = None

    def getLoggerExtra(self):
        return self.document.getLoggerExtra()

    @synchronized
    def _getClockState(self):
        if self.statusElement is None:
            eventParents = self.tree.getroot().findall('.//tt:events/..', NAMESPACES)
            if eventParents:
                self.statusElement = eventParents[0]
            else:
                # If there are no events in the document we use the first child of the root.
                self.statusElement = list(self.tree.getroot())[0]
        curClock = self.document.events()._getClock(self.statusElement)
        if curClock:
            curClock = float(curClock)
        else:
            curClock = 0
        clockRunning = self.statusElement.get(NS_TIMELINE_INTERNAL("clockRunning"))
        playing = not not (clockRunning and clockRunning != "false")
        return curClock, playing

    @synchronized
    def get(self):
        if self.statusElement is None:
            eventParents = self.tree.getroot().findall('.//tt:events/..', NAMESPACES)
            if eventParents:
                self.statusElement = eventParents[0]
            else:
                # If there are no events in the document we use the first child of the root.
                self.statusElement = list(self.tree.getroot())[0]
        curClock, playing = self._getClockState()
        active = not not (self.document.serve().contextID)
        rv = dict(active=active)
        if not active:
            rv["status"] = "Preview player is not running"
        if active:
            rv["playing"] = playing
        if curClock and curClock != "0":
            rv["position"] = float(curClock)
        if self.document.lastErrorMessage:
            rv["status"] = self.document.lastErrorMessage
        return rv

    @synchronized
    def control(self, command):
        if not isinstance(command, dict):
            self.logger.error('remote/control: requires JSON object', extra=self.getLoggerExtra())
            self.document.setError('Internal error: remote/control requires JSON object')
            abort(400, 'remote/control requires JSON object')
        self.logger.debug("remote/control: %s" % repr(command), extra=self.getLoggerExtra())
        for contextID in self.document.serve().allContextIDs:
            wsUrl = GlobalSettings.websocketService + "bus-message/remote-control-clock-" + contextID
            try:
                r = requests.post(wsUrl, json=command)
                r.raise_for_status
            except requests.exceptions.RequestException:
                self.logger.error("remote/control: POST to %s failed" % wsUrl, extra=self.getLoggerExtra())
                self.document.setError("Cannot communicate with preview client")
            self.document.clearError()
        else:
            self.logger.error("remote/control: no contextID for preview client", extra=self.getLoggerExtra())
            self.document.setError('No preview client is running')
            abort(500, 'remote/control: no contextID for preview client')
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
        self.allContextIDs = []
        self.contextID = None
        self.callbacks = set()
        self.lastClientServed = None
        self.lastClientToTimelineServedDeltaT = None
        self.operationHistory = []
        self.logger = self.document.logger.getChild('serve')

    def getLoggerExtra(self):
        return self.document.getLoggerExtra()

    @synchronized
    def _nextGeneration(self, sameValue):
        rootElt = self.tree.getroot()
        gen = int(rootElt.get(NS_AUTH("generation"), 0))
        if not sameValue:
            gen += 1
        rootElt.set(NS_AUTH("generation"), str(gen))
        return gen

    @synchronized
    def get_timeline(self, viewer=False):
        """Get timeline document contents (xml) for this authoring document.
        At the moment, this is actually the whole authoring document itself."""
        self.logger.info('serving timeline.xml document', extra=self.getLoggerExtra())
        if self.lastClientServed and self.lastClientToTimelineServedDeltaT is None:
            self.lastClientToTimelineServedDeltaT = time.time() - self.lastClientServed
            self.logger.info('delta-T between client.json and timeline.xml set to %f', self.lastClientToTimelineServedDeltaT)
        return ET.tostring(self.tree.getroot())

    @synchronized
    def get_layout(self, viewer=False):
        """Get the layout document contents (json) for this authoring document.
        At the moment, the layout document JSON representation is stored in a toplevel
        au:rawLayout element. This will change when the authoring tool starts modifying the
        layout document data."""
        self.logger.info('serving layout.json document', extra=self.getLoggerExtra())
        rawLayoutElement = self.tree.getroot().find('.//au:rawLayout', NAMESPACES)
        if rawLayoutElement is None:
            self.logger.error('get_layout: no au:rawLayout element in document', extra=self.getLoggerExtra())
            self.document.setError('No au:rawLayout element in document')
            abort(404, 'No au:rawLayout element in document')
        return rawLayoutElement.text

    @synchronized
    def put_layout(self, layoutJSON):
        """Temporary method, stores the raw layout document data in the authoring document."""
        self.logger.info('storing layout.json document', extra=self.getLoggerExtra())
        rawLayoutElement = self.tree.getroot().find('.//au:rawLayout', NAMESPACES)
        if rawLayoutElement is None:
            rawLayoutElement = ET.SubElement(self.tree.getroot(), 'au:rawLayout')
        rawLayoutElement.text = layoutJSON

    def get_client(self, timeline, layout, base=None, mode=None, viewer=False):
        """Return the client.api document that describes this dmapp"""
        self.logger.info('serving client.json document', extra=self.getLoggerExtra())
        self.lastClientServed = time.time()
        startPaused = self.document.settings().startPaused
        curClock, playing = self.document.remote()._getClockState()
        if curClock:
            # The document is already running (or has been running)
            # Adapt the URL for the timeline so that it fast-forwards to the current position.
            if self.lastClientToTimelineServedDeltaT:
                self.logger.info('Augment document time-position %f with delta-t %f', curClock, self.lastClientToTimelineServedDeltaT)
                curClock += self.lastClientToTimelineServedDeltaT
            timeline = timeline + "#t=%f" % curClock
            self.logger.info('Fast-forward new client to %f' % curClock)
            # And we set the new player to the same playing/paused mode as the old one
            startPaused = not playing

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
        if clientExtraElement is not None and clientExtraElement.text:
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
                layoutService=GlobalSettings.layoutService,
                websocketService=GlobalSettings.websocketService,
                timelineService=GlobalSettings.timelineService,
                )
        #
        # And we add the remoteControlTimelineMasterOverride to debugOptions so we can remotely control the player
        if startPaused:
            rcValue = dict(playing=False)
        else:
            rcValue = True
        clientDoc['debugOptions']['remoteControlTimelineMasterOverride'] = rcValue
        #
        # And we set the playback mode
        #
        if not mode:
            mode = self.document.settings().playerMode
        # Note that this should be user-settable, depending on this flag the preview will run
        # in single-device (standalone) or TV mode.
        clientDoc['mode'] = mode
        #
        # And set webcam mode, if requested (and this is a preview player)
        #
        if not viewer and self.document.settings().previewFromWebcam:
            if not 'localSignalValues' in clientDoc:
                clientDoc['localSignalValues'] = {}
            clientDoc['localSignalValues']['football-webcam-mode'] = True

        return json.dumps(clientDoc)

    @synchronized
    def put_client(self, clientJSON):
        """Temporary method, store per-dmapp client.json settings in the authoring document"""
        self.logger.info('storing additions to client.json document', extra=self.getLoggerExtra())
        rawClientElement = self.tree.getroot().find('.//au:rawClient', NAMESPACES)
        if rawClientElement is None:
            rawClientElement = ET.SubElement(self.tree.getroot(), 'au:rawClient')
        rawClientElement.text = layoutJSON

    @synchronized
    def getLiveInfo(self, contextID=None, viewer=False):
        rv = {'toTimeline' : self.document.async().getOutgoingConnectionInfo()}
        if not viewer and contextID is not None and self.contextID is None:
            self.logger.info('overriding contextID with %s' % contextID)
            self.contextID = contextID
            self.document._loggerExtra['contextID'] = contextID
        if not viewer:
            rv['fromTimeline'] = self.document.async().getIncomingConnectionInfo()
        if contextID and not contextID in self.allContextIDs:
            self.allContextIDs.append(contextID)
        curClock, playing = self.document.remote()._getClockState()
        if curClock:
            # This is a temporary hack (xxxjack)
            # The live Dash feeds are a fairly-fixed amount behind the live feed.
            # We adapt for that.
            offset = self.document.settings().videoOverrideOffset
            if offset and viewer:
                curClock -= float(offset)
            rv['currentTime'] = curClock
        self.logger.info('getLiveInfo(%s)' % contextID, extra=self.getLoggerExtra())
        self.document.forwardHandler = self
        self.document.async().requestBroadcastToFrontends()
        return rv

    @synchronized
    def _setDocumentState(self, documentState):
        self.logger.debug("_setDocumentState: got %d element-state items" % len(documentState), extra=self.getLoggerExtra())
        self.document.companionTimelineIsActive = True
        for eltId, eltState in documentState.items():
            elt = self.document._getElementByID(eltId)
            if elt is None:
                self.logger.warning('_setDocumentState: unknown element %s' % eltId, extra=self.getLoggerExtra())
                continue
            changed = self._elementStateChanged(elt, eltState)
            if changed:
                self.logger.debug("_setDocumentState: %s: changed" % eltId, extra=self.getLoggerExtra())
                # If this was one of our events and it has become inactive we may want to remove the trigger
                # that caused this
                self.logger.debug("xxxjack productionIdTransient %s, state %s, productionId %s" % (elt.get(NS_TRIGGER("productionIdTransient"), False), elt.get(NS_TIMELINE_INTERNAL("state"), None), elt.get(NS_TRIGGER("productionId"), None)))
                if elt.get(NS_TRIGGER("productionIdTransient"), False):
                    if elt.get(NS_TIMELINE_INTERNAL("state"), None) == "finished":
                        productionId = elt.get(NS_TRIGGER("productionId"), None)
                        self.logger.debug('_setDocumentState: element finished: %s, productionId %s' % (eltId, productionId))
                        if productionId:
                            self.document.events()._productionIdFinished(productionId)
        self.document.async().requestBroadcastToFrontends()

    def _elementStateChanged(self, elt, eltState):
        """Timeline service has sent new state for this element. Return True if anything has changed."""
        newState = eltState.get(NS_TIMELINE_INTERNAL("state"))
        if newState == 'idle':
            newState = None
        newProgress = eltState.get(NS_TIMELINE_INTERNAL("progress"))
        if newProgress:
            newEpoch = self.document.clock.now() - float(newProgress)
        else:
            newEpoch = None
        newClockRunning = eltState.get(NS_TIMELINE_INTERNAL("clockRunning"))
        if not newClockRunning or newClockRunning == "false":
            newClockRunning = None

        oldState = elt.get(NS_TIMELINE_INTERNAL("state"))
        oldEpoch = elt.get(NS_TIMELINE_INTERNAL("epoch"))
        oldClockRunning = elt.get(NS_TIMELINE_INTERNAL("clockRunning"))
        if not oldClockRunning or oldClockRunning == "false":
            oldClockRunning = None
        if oldEpoch:
            oldEpoch = float(oldEpoch)

        def almostEqual(t1, t2):
            if not t1 and not t2:
                return True
            if not t1 or not t2:
                return t1 == t2
            return abs(t1-t2) < 0.01

        if oldState == newState and almostEqual(oldEpoch, newEpoch) and oldClockRunning == newClockRunning:
            return False

        self.logger.debug("eltStateChanged(%s): state=%s epoch=%s clockRunning=%s" % (self.document._getXPath(elt), newState, newEpoch, newClockRunning), extra=self.getLoggerExtra())
        if newState:
            elt.set(NS_TIMELINE_INTERNAL("state"), newState)
        else:
            elt.attrib.pop(NS_TIMELINE_INTERNAL("state"), None)
        if newEpoch:
            elt.set(NS_TIMELINE_INTERNAL("epoch"), str(newEpoch))
        elif NS_TIMELINE_INTERNAL("epoch") in elt.attrib:
            elt.attrib.pop(NS_TIMELINE_INTERNAL("epoch"))
        if newClockRunning:
            elt.set(NS_TIMELINE_INTERNAL("clockRunning"), newClockRunning)
            self.document.clock.start()
        else:
            if NS_TIMELINE_INTERNAL("clockRunning") in elt.attrib:
                elt.attrib.pop(NS_TIMELINE_INTERNAL("clockRunning"))
            if newEpoch:
                self.document.clock.stop()

        return True

    def forward(self, operations):
        if len(operations) and len(self.callbacks):
            self.logger.info('forward %d operations to %d callbacks' % (len(operations), len(self.callbacks)), extra=self.getLoggerExtra())
        else:
            self.logger.debug('forward %d operations to %d callbacks' % (len(operations), len(self.callbacks)), extra=self.getLoggerExtra())
        gen = self._nextGeneration(not operations)
        if operations:
            self._memorizeOperations(gen, operations)
        #
        # Forward to websocket listeners first
        #
        self.document.async().forwardDocumentModifications(dict(generation=gen, operations=operations))
        #
        # Now forward to REST listeners (code to be removed soon)
        #
        toRemove = []
        wantStateUpdates = True
        for callback in self.callbacks:
            try:
                requestStartTime = time.time()  # Debugging: sometimes requests take a very long time
                args = dict(generation=gen, operations=operations)
                # for the first successful one, add updateState=True
                if wantStateUpdates:
                    args['wantStateUpdates'] = True
                r = requests.put(callback, json=args)
                r.raise_for_status()
                wantStateUpdates = False
            except requests.exceptions.RequestException:
                self.logger.warning("forward: PUT failed for %s" % callback, extra=self.getLoggerExtra())
                self.document.setError("Error communicating to timeline service")
                toRemove.append(callback)
            else:
                requestDuration = time.time() - requestStartTime
                if requestDuration > 2:
                    self.logger.warning("forward: PUT took %d seconds for %s" % (requestDuration, callback), extra=self.getLoggerExtra())

            # Only continue if we have anything to say...
            if not operations and not wantStateUpdates:
                break

        for callback in toRemove:
            self.logger.info('removeCallback(%s)' % callback, extra=self.getLoggerExtra())
            self.callbacks.discard(callback)

    @synchronized
    def _memorizeOperations(self, gen, operations):
        """Remember old operations, solater clients can refresh in case they missed some between getting the document and
        starting to listen to the broadcasts."""
        assert len(self.operationHistory) <= gen
        while len(self.operationHistory) < gen:
            self.operationHistory.append((len(self.operationHistory), []))
        self.operationHistory.append((gen, operations))

    @synchronized
    def gethistory(self, oldest=None, viewer=False):
        if not oldest:
            oldest = 0
        oldest = int(oldest)
        rv = self.operationHistory[oldest:]
        return rv


class DocumentSettings:
    def __init__(self, document):
        self.document = document
        self.lock = self.document.lock
        self.logger = self.document.logger.getChild('settings')

        self.startPaused = False
        self.playerMode = GlobalSettings.mode
        self.previewFromWebcam = False
        self.videoOverrideUrl = ""
        self.videoOverrideOffset = ""

    def getLoggerExtra(self):
        return self.document.getLoggerExtra()

    def get(self, frontend, backend):
        return dict(
            startPaused=self.startPaused,
            playerMode=self.playerMode,
            debugLinks=self._getDebugLinks(frontend, backend),
            description=self.document.description,
            videoOverrideUrl=self.videoOverrideUrl,
            videoOverrideOffset=self.videoOverrideOffset,
            previewFromWebcam=self.previewFromWebcam
            )

    def set(self, startPaused=None, playerMode=None, description=None, videoOverrideUrl=None, videoOverrideOffset=None, previewFromWebcam=None):
        if startPaused is not None:
            self.startPaused = startPaused
        if playerMode is not None:
            self.playerMode = playerMode
        if description is not None:
            self.document.description = description
        if videoOverrideUrl is not None:
            self.videoOverrideUrl = videoOverrideUrl
        if videoOverrideOffset is not None:
            self.videoOverrideOffset = videoOverrideOffset
        if previewFromWebcam is not None:
            self.previewFromWebcam = previewFromWebcam
        return ""

    def _getDebugLinks(self, frontend, backend):
        frontendURL = frontend + "#documentID=%s" % self.document.documentId
        backendURL = backend + "/document/%s" % self.document.documentId
        rv = {
            "Open This Document Again": frontendURL,
            "Backend REST Endpoint": backendURL
        }
        contextID = self.document.serve().contextID
        if contextID:
            kibanaCommand = "#/discover/All-2-Immerse-prefixed-logs-without-Websocket-Service?_g=(refreshInterval:(display:'10%%20seconds',pause:!f,section:1,value:10000),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(sourcetime,source,subSource,verb,logmessage,contextID,message),filters:!(),index:'logstash-*',interval:auto,query:(query_string:(analyze_wildcard:!t,query:'rawmessage:%%22%%2F%%5E2-Immerse%%2F%%22%%20AND%%20NOT%%20source:%%22WebsocketService%%22%%20AND%%20contextID:%%22%s%%22')),sort:!(sourcetime,desc))"
            rv["Kibana Log"] = GlobalSettings.kibanaService + (kibanaCommand % contextID)
            rv["Timeline Dump"] = GlobalSettings.timelineService + '/context/' + contextID + '/dump'
        return rv


class DocumentAsync(threading.Thread):
    def __init__(self, document):
        self.document = document
        self.lock = self.document.lock
        self.logger = self.document.logger.getChild('async')
        self.logger.debug('DocumentAsync: created')
        threading.Thread.__init__(self)
        self.socket = None
        self.channel = None
        if self.document.testMode:
            return
        websocket_service = GlobalSettings.websocketService
        # Remove trailing slash (not sure why it's there in the first place?)
        if websocket_service[-1] == "/":
            websocket_service = websocket_service[:-1]

        self.socket = SocketIO(websocket_service)
        self.channel = self.socket.define(SocketIONamespace, "/trigger")
        
        self.roomFrontend = str(self.document.documentId)
        self.roomUpdates = 'toBackend-' + str(self.document.documentId)
        self.roomModifications = 'toTimelines-' + str(self.document.documentId)
        
        self.channel.on('STATUS', self.incomingDocumentStatus)
        
        self.channel.emit('JOIN', self.roomUpdates)

        self.running = True
        self.start()
    
    def getIncomingConnectionInfo(self):
        websocket_service = GlobalSettings.websocketService
        # Remove trailing slash (not sure why it's there in the first place?)
        if websocket_service[-1] == "/":
            websocket_service = websocket_service[:-1]
        return dict(server=websocket_service, channel='/trigger', room=self.roomUpdates)
    
    def getOutgoingConnectionInfo(self):
        websocket_service = GlobalSettings.websocketService
        # Remove trailing slash (not sure why it's there in the first place?)
        if websocket_service[-1] == "/":
            websocket_service = websocket_service[:-1]
        return dict(server=websocket_service, channel='/trigger', room=self.roomModifications)
    
    def stop(self):
        self.running = False
        
    def run(self):
        self.logger.debug('DocumentAsync listener started')
        while self.running:
            try:
                self.socket.wait(5)
            except:
                # I hate bare except clauses, but I don't know what to do else...
                import traceback
                traceback.print_exc()
        self.logger.debug('DocumentAsync listener stopped')

    @synchronized
    def requestBroadcastToFrontends(self):
        self.broadcastEventsToFrontends()

    @synchronized
    def broadcastEventsToFrontends(self):
        events = self.document.events().get(caller='broadcast')
        if not self.channel:
            self.logger.debug('DocumentAsync.broadcastEventsToFrontends(...) skipped (test mode)')
            return            
        self.logger.debug('DocumentAsync.broadcastEventsToFrontends(...)')
        self.channel.emit("BROADCAST_EVENTS", self.roomFrontend, events)

    def forwardDocumentModifications(self, modifications):
        if not self.channel:
            self.logger.debug('DocumentAsync.forwardDocumentModifications(...) skipped (test mode)' )
            return
        self.logger.debug('DocumentAsync.forwardDocumentModifications(...)' )
        self.channel.emit("BROADCAST_UPDATES", self.roomModifications, modifications)
        
    def incomingDocumentStatus(self, documentState):
        self.logger.debug('DocumentAsync.incomingDocumentStatus(%s)' % repr(documentState))
        self.document.serve()._setDocumentState(documentState)
