from flask import Response, request, abort
import urllib2
import json
import copy
import xml.etree.ElementTree as ET

class Document:
    def __init__(self):
        self.document = None
        self.parentMap = None
        
    def index(self):
        if request.method == 'PUT':
            if request.data:
                self.loadXml(request.data)
                return ''
            elif 'url' in request.args:
                self.load(request.args['url'])
                return ''
        else:
            return Response(ET.tostring(self.document.root), mimetype="application/xml")    
                
    def loadXml(self, data):
        root = ET.fromstring(data)
        self.document = ET.ElementTree(root)
        self.parentMap = {c:p for p in self.document.iter() for c in p}
        return ''
        
    def load(self, url):
        fp = urllib2.urlopen(url)
        self.document = ET.parse(fp)
        self.parentMap = {c:p for p in self.document.iter() for c in p}
        return ''
        
    def dump(self):
        return '%d elements' % self._count()

    def _count(self):
        totalCount = 0
        for _ in self.document.iter():
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
            positions = self.document.findall(path)
        else:
            positions = self.document.getroot().findall(path)
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
            self.parentMap[newElement] = element
        elif where == 'end':
            element.append(newElement)
            self.parentMap[newElement] = element
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
            self.parentMap[newElement] = parent
        elif where == 'after':
            parent = self._getParent(element)
            pos = list(parent).index(element)
            if pos == len(list(parent)):
                parent.append(newElement)
            else:
                parent.insert(pos+1, newElement)
            self.parentMap[newElement] = parent
        else:
            abort(400)
        return self._getXPath(newElement)
        
    def cut(self, path, mimetype='application/x-python-object'):
        element = self._getElement(path)
        parent = self._getParent(element)
        parent.remove(element)
        del self.parentMap[element]
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
        # newElement._setroot(None)
        return self.paste(path, where, None, newElement)
        
    def move(self, path, where, sourcepath):
        element = self._getElement(path)
        sourceElement = self.cut(sourcepath)
        # newElement._setroot(None)
        return self.paste(path, where, None, sourceElement)
        
