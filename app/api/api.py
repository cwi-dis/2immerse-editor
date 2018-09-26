from __future__ import absolute_import
from flask import abort, jsonify, Response, request
import uuid
from . import document


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
            doc = document.Document(documentId)

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

        rv = []
        for k, d in self.documents.items():
            descr = d.getDescription()
            rv.append(dict(id=k, description=descr))
        return jsonify(rv)

api = API()
