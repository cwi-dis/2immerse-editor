from flask import Response, request
import urllib

class Document:
    def __init__(self):
        self.data = ''
        
    def index(self):
        if request.method == 'PUT':
            if request.data:
                self.loadXml(request.data)
            elif 'url' in request.args:
                self.load(request.args['url'])
                return 'ok'
        else:
            return Response(self.data, mimetype="application/xml")    
                
    def loadXml(self, data):
        self.data = data
        print 'xxxjack data loaded:', data
        return 'ok'
        
    def load(self, url):
        print 'xxxjack loading from url:', url
        data = urllib.urlopen(url).read()
        return self.loadXml(data)
        