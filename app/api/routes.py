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
    
@app.route(API_ROOT + "/document/<uuid:documentId>/events")
def document_events_get(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    events = document.events()
    assert events
    rv = events.get()
    return return Response(json.dumps(rv), mimetype="application/json")    

@app.route(API_ROOT + "/document/<uuid:documentId>/events/<id>/trigger", methods=["POST"])
def document_events_trigger(documentId, id):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    events = document.events()
    assert events
    parameters = request.get_json()
    if type(parameters) != type([]):
        abort(405)
    events.trigger(id, parameters)
    return ''

@app.route(API_ROOT + "/document/<uuid:documentId>/events/<id>/modify", methods["PUT"])
def document_events_modify(documentId, id):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    events = document.events()
    assert events
    events.modify(id, parameters)
    return ''
