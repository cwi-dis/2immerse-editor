from flask import jsonify, Response, request
import uuid
import document

class API:
    def __init__(self):
        self.documents = {}
        
    def dump(self):
        return 'Nothing to show yet'
        
    def testjson(self):
        return jsonify(dict(hello="world", answer=43))
        
    def testxml(self):
        return Response('<data><hello>world</hello><answer>43</answer></data>', mimetype="application/xml")
        
    def document(self):
        if request.method == 'POST':
            documentId = uuid.uuid4()
            doc = document.Document()
            if request.data:
                doc.loadXml(request.data)
            elif 'url' in request.args:
                doc.load(request.args['url'])
            self.documents[documentId] = doc
            return jsonify(documentId=documentId)
        return jsonify(self.documents.keys())
        
api = API()
