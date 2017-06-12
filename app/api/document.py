from flask import Response, request
import urllib2
import xml.etree.ElementTree as ET

class Document:
    def __init__(self):
        self.data = ''
        
    def index(self):
        if request.method == 'PUT':
            if request.data:
                self.loadXml(request.data)
                return ''
            elif 'url' in request.args:
                self.load(request.args['url'])
                return ''
        else:
            return Response(self.data, mimetype="application/xml")    
                
    def loadXml(self, data):
        self.data = data
        print 'xxxjack data loaded:', data
        return ''
        
    def load(self, url):
        print 'xxxjack loading from url:', url
        fp = urllib2.urlopen(url)
        self.document = ET.parse(fp)
        return ''
        
    def dump(self):
        rv = 'size: %d\n' % len(self.data)
        rv += 'data: %s\n' % repr(self.data)
        return rv
