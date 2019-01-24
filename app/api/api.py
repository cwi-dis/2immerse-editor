"""Copyright 2018 Centrum Wiskunde & Informatica

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
from __future__ import absolute_import
from __future__ import unicode_literals
from builtins import object
from flask import abort, jsonify, Response, request
import uuid
from . import document


class API(object):
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
        for k, d in list(self.documents.items()):
            descr = d.getDescription()
            rv.append(dict(id=k, description=descr))
        return jsonify(rv)

api = API()
