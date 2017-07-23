from flask import abort, jsonify, Response, request
import uuid
import document


class API:
    def __init__(self):
        self.documents = {}

    def dump(self):
        rv = '%d documents\n\n' % len(self.documents)

        for k in self.documents:
            rv += '%s:\n%s\n' % (k, self.documents[k].dump())

        return rv

    def document(self):
        if request.method == 'POST':
            documentId = uuid.uuid4()
            doc = document.Document()

            if 'url' in request.args:
                doc.load(request.args['url'])
            elif request.files and request.files["document"]:
                docstream = request.files["document"].stream
                doc.loadXml(docstream.read())
            elif request.data:
                doc.loadXml(request.data)
            else:
                abort(400)

            self.documents[documentId] = doc

            return jsonify(documentId=documentId)

        return jsonify(self.documents.keys())

api = API()
