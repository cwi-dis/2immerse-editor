from app import app
from api import api

API_ROOT = '/api/v1'

@app.route(API_ROOT + "/<string:verb>")
def api_verb(verb):
    try:
        func = getattr(api, verb)
    except AttributeError:
        abort(404)
    return func()
    
@app.route(API_ROOT + "/document", methods=["GET", "POST"])
def document():
    return api.document()
    
@app.route(API_ROOT + "/document/<uuid:documentId>", methods=["GET", "PUT"])
def document_instance(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    return document.index()
    
@app.route(API_ROOT + "/document/<uuid:documentId>/<string:verb>")
def document_instance_verb(documentId, verb):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    try:    
        func = getattr(document, verb)
    except AttributeError:
        abort(404)
    return func()
    
