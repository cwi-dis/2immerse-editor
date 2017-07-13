from flask import Response, request, abort
import urllib2
import urllib
import urlparse
import json
import copy
import xml.etree.ElementTree as ET
import re

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

class Document:
    def __init__(self):
        self.tree = None
        self.parentMap = None
        self.idMap = None
        self.nameSet = None
        self.eventsHandler = None
        self.authoringHandler = None
        self.serveHandler = None
        
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
            
    def _documentLoaded(self):
        self.parentMap = {c:p for p in self.tree.iter() for c in p}
        self.idMap = {}
        self.nameSet = set()
        for e in self.tree.iter():
            id = e.get(NS_XML('id'))
            if id:
                self.idMap[id] = e
            name = e.get(NS_TRIGGER('name'))
            if name:
                self.nameSet.add(name)
            
        
    def _elementAdded(self, elt, parent, recursive=False):
        assert not elt in self.parentMap
        self.parentMap[elt] = parent
        id = elt.get(NS_XML('id'))
        if id:
            assert not id in self.idMap
            self.idMap[id] = elt
        name = elt.get(NS_TRIGGER('name'))
        if name:
            self.nameSet.add(name)
        if recursive:
            for ch in elt:
                self._elementAdded(ch, elt, True)
            
    def _elementDeleted(self, elt, recursive=False):
        if elt in self.parentMap:
            del self.parentMap[elt]
        id = elt.get(NS_XML('id'))
        if id and id in self.idMap:
            del self.idMap[id]
        # We do not remove tt:name, it may occur multiple times so we are not
        # sure it has really disappeared
        if recursive:
            for ch in elt:
                self._elementDeleted(ch, True)
            
    def _afterCopy(self, elt):
        """Adjust element attributes (xml:id and tt:name) after a copy.
        Makes them unique. Does not insert them into the datastructures yet."""
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
            
    def events(self):
        if not self.eventsHandler:
            self.eventsHandler = DocumentEvents(self)
        return self.eventsHandler
        
    def authoring(self):
        if not self.authoringHandler:
            self.authoringHandler = DocumentAuthoring(self)
        return self.authoringHandler
        
    def serve(self):
        if not self.serveHandler:
            self.serveHandler = DocumentServe(self)
        return self.serveHandler
        
    def loadXml(self, data):
        root = ET.fromstring(data)
        self.tree = ET.ElementTree(root)
        self._documentLoaded()
        return ''
        
    def load(self, url):
        fp = urllib2.urlopen(url)
        self.tree = ET.parse(fp)
        self._documentLoaded()
        return ''
        
    def save(self, url):
        p = urlparse.urlparse(url)
        assert p.scheme == 'file'
        filename = urllib.url2pathname(p.path)
        fp = open(filename, 'w')
        fp.write(ET.tostring(self.tree.getroot()))
        
    def dump(self):
        return '%d elements' % self._count()

    def _count(self):
        totalCount = 0
        for _ in self.tree.iter():
            totalCount += 1
        return totalCount 
        
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
            newElement = ET.Element(tag, data)
        elif mimetype == 'application/xml':
            newElement = ET.fromstring(data)
        else:
            abort(400)
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
        
    def _getXPath(self, elt):
        parent = self._getParent(elt)
        if parent is None:
            return '/'
        index = 0
        for ch in parent:
            if ch is elt:
                break
            if ch.tag == elt.tag:
                index += 1
        rv = self._getXPath(parent)
        if rv == '/':
            # ET uses funny absolute paths (exculding root tag name) so
            # we work around this by doing relative paths only (from root)
            rv = ''
        else:
            rv += '/'
        tagname = elt.tag
        rv += tagname
        if index:
            rv = rv + '[%d]' % (index+1)
        return rv
        
    def _getElement(self, path):
        if path[:1] == '/':
            positions = self.tree.findall(path, NAMESPACES)
        else:
            positions = self.tree.getroot().findall(path, NAMESPACES)
        if not positions:
            abort(404)
        if len(positions) > 1:
            abort(400)
        element = positions[0]
        return element
            
    def paste(self, path, where, tag, data, mimetype='application/x-python-object'):
        #
        # where should it go?
        #
        element = self._getElement(path)
        #
        # what should go there?
        #
        newElement = self._toET(tag, data, mimetype)
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
            self._elementAdded(newElement, element, recursive=True)
        elif where == 'end':
            element.append(newElement)
            self._elementAdded(newElement, element, recursive=True)
        elif where == 'replace':
            element.clear()
            for k, v in newElement.items():
                element.set(k, v)
            for e in list(newElement):
                element.append(e)
            newElement = element
        elif where == 'before':
            parent = self._getParent(element)
            pos = list(parent).index(element)
            parent.insert(pos, newElement)
            self._elementAdded(newElement, parent, recursive=True)
        elif where == 'after':
            parent = self._getParent(element)
            pos = list(parent).index(element)
            if pos == len(list(parent)):
                parent.append(newElement)
            else:
                parent.insert(pos+1, newElement)
            self._elementAdded(newElement, parent, recursive=True)
        else:
            abort(400)
        return self._getXPath(newElement)
        
    def cut(self, path, mimetype='application/x-python-object'):
        element = self._getElement(path)
        parent = self._getParent(element)
        parent.remove(element)
        self._elementDeleted(element, recursive=True)
        return self._fromET(element, mimetype)
        
    def get(self, path, mimetype='application/x-python-object'):
        element = self._getElement(path)
        return self._fromET(element, mimetype)
        
    def modifyAttributes(self, path, attrs, mimetype='application/x-python-object'):
        element = self._getElement(path)
        if mimetype == 'application/x-python-object':
            pass
        elif mimetype == 'application/json':
            attrs = json.loads(attrs)
        else:
            abort(400)
        assert type(attrs) == type({})
        existingAttrs = element.attrib
        for k, v in attrs:
            if v == None:
                if k in existingAttrs:
                    existingAttrs.pop(k)
            else:
                existingAttrs[k] = v
        return self._getXPath(element)
        
    def modifyData(self, path, data):
        element = self._getElement(path)
        if data == None:
            self.text = None
            self.tail = None
        else:
            self.text = data
            self.tail = None
        return self._getXPath(element)
        
    def copy(self, path, where, sourcepath):
        element = self._getElement(path)
        sourceElement = self._getElement(sourcepath)
        newElement = copy.deepcopy(sourceElement)
        self._afterCopy(newElement)
        # newElement._setroot(None)
        return self.paste(path, where, None, newElement)
        
    def move(self, path, where, sourcepath):
        element = self._getElement(path)
        sourceElement = self.cut(sourcepath)
        # newElement._setroot(None)
        return self.paste(path, where, None, sourceElement)
        
class DocumentEvents:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        
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
        return rv
        
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
            parameters.append(pData)
        name = elt.get(NS_TRIGGER('name'))
        idd = elt.get(NS_XML('id'))
        return dict(name=name, id=idd, trigger=trigger, modify=not trigger, parameters=parameters)
        
    def _getParameter(self, parameter):
        try:
            parPath = parameter['parameter']
            parValue = parameter['value']
        except KeyError:
            abort(400)
        match = FIND_PATH_ATTRIBUTE.match(parPath)
        if not match:
            abort(400)
        path = match.group(1)
        attr = match.group(2)
        if ':' in attr:
            ns, rest = attr.split(':')
            namespace = NAMESPACES[ns]
            attr = '{%s}%s' % (namespace, rest)
        return path, attr, parValue
        
        
    def trigger(self, id, parameters):
        element = self.document.idMap.get(id)
        if element == None:
            abort(404)
        if False:
            # Cannot get above starting point with elementTree:-(
            newParentPath = element.get(NS_TRIGGER('target'), '..')
            newParent = element.find(newParentPath)
        else:
            tmp = self.document._getParent(element)
            newParent = self.document._getParent(tmp)
        
        assert newParent != None
        newElement = copy.deepcopy(element)
        self.document._afterCopy(newElement)
        for par in parameters:
            path, attr, value = self._getParameter(par)
            print 'xxxjack path', path
            e = newElement.find(path, NAMESPACES)
            if e == None:
                abort(400)
            e.set(attr, value)
        newParent.append(newElement)
        self.document._elementAdded(newElement, newParent, recursive=True)
        return newElement.get(NS_XML('id'))
            
    def modify(self, id, parameters):
        element = self.document.idMap.get(id)
        if element == None:
            abort(404)
        for par in parameters:
            path, attr, value = self._getParameter(par)
            e = element.find(path, NAMESPACES)
            if e == None:
                abort(400)
            e.set(attr, value)

class DocumentAuthoring:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree

class DocumentServe:
    def __init__(self, document):
        self.document = document
        self.tree = document.tree
        
    def get_timeline(self):
        """Get timeline document contents (xml) for this authoring document.
        At the moment, this is actually the whole authoring document itself."""
        return ET.tostring(self.tree.getroot())
        
    def get_layout(self):
        """Get the layout document contents (json) for this authoring document.
        At the moment, the layout document JSON representation is stored in a toplevel
        au:rawLayout element. This will change when the authoring tool starts modifying the
        layout document data."""
        rawLayoutElement = self.tree.getroot().find('.//au:rawLayout', NAMESPACES)
        if rawLayoutElement == None:
            abort(404)
        return rawLayoutElement.text
        
    def put_layout(self, layoutJSON):
        """Temporary method, stores the raw layout document data in the authoring document."""
        rawLayoutElement = self.tree.getroot().find('.//au:rawLayout', NAMESPACES)
        if rawLayoutElement == None:
            rawLayoutElement = ET.SubElement(self.tree.getroot(), 'au:rawLayout')
        rawLayoutElement.text = layoutJSON
        
    def get_client(self, timeline, layout):
        clientDoc = dict(
            description="Live Preview",
            mode="tv",
            serviceUrlPreset="aws_edge",
            controllerOptions=dict(
                deviceIdPrefix="tv",
                deviceIdNamespace="ts-tv",
                defaultLogLevel="trace",
                networkLogLevel="trace",
                longFormConsoleLogging=True,
                showUserErrorMessageUI=True,
                ),
            debugOptions=dict(
                debugComponent=True,
                devLogging=True,
                failurePlaceholders=True,
                ),
            variations=[
                dict(
                    name="Live Preview",
                    description="Live Preview",
                    type="select",
                    options=[
                        dict(
                            name="Live Preview",
                            description="Live Preview",
                            content=dict(
                                serviceInput=dict(
                                    layout=layout,
                                    timeline=timeline,
                                    ),                            
                                ),
                        ),
                    ],
                    ),
                ],
            )
        return json.dumps(clientDoc)
