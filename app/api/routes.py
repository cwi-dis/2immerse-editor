from app import app
from api import api
from flask import Response, request, abort
import json

API_ROOT = '/api/v1'

#
# Global routes
#
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

#
# Per-document commands, load and save and such
#

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

#
# per-document, xml aspect, cut/copy/paste and such on the xml structure
#

# cut, paste, get and modifyAttributes need work to make the API more restful

@app.route(API_ROOT + "/document/<uuid:documentId>/xml/copy", methods=["POST"])
def document_xml_paste(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    xml = document.xml()
    assert xml
    rv = xml.copy(path=request.args['path'], where=request.args['where'], sourcepath=request.args['sourcepath'])
    return rv

@app.route(API_ROOT + "/document/<uuid:documentId>/xml/move", methods=["POST"])
def document_xml_move(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    xml = document.xml()
    assert xml
    rv = xml.move(path=request.args['path'], where=request.args['where'], sourcepath=request.args['sourcepath'])
    return rv

@app.route(API_ROOT + "/document/<uuid:documentId>/xml/modifyData", methods=["PUT"])
def document_xml_modify(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    xml = document.xml()
    assert xml
    rv = xml.modifyData(path=request.args['path'], data=request.args['data'])
    return rv


#
# per-document, authoring aspect, for the authoring tool
#

#
# per-document, event aspect, for the triggering tool
#

@app.route(API_ROOT + "/document/<uuid:documentId>/events")
def document_events_get(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    events = document.events()
    assert events
    rv = events.get()
    return Response(json.dumps(rv), mimetype="application/json")

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

@app.route(API_ROOT + "/document/<uuid:documentId>/events/<id>/modify", methods=["PUT"])
def document_events_modify(documentId, id):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    events = document.events()
    assert events
    parameters = request.get_json()
    if type(parameters) != type([]):
        abort(405)
    events.modify(id, parameters)
    return ''

#
# Per-document, serve aspect, for consumption of views on the document
#

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/timeline.xml")
def get_timeline_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    return Response(serve.get_timeline(), mimetype="application/xml")

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/layout.json")
def get_layout_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    return Response(serve.get_layout(), mimetype="application/json")

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/layout.json", methods=["PUT"])
def put_layout_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    layoutJSON = request.get_data()  # Gets raw data, without parsing
    _ = json.loads(layoutJSON)  # Assure it is actually json
    serve.put_layout(layoutJSON)
    return ''

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/client.json")
def get_client_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    docRoot = '%s/document/%s/serve/' % (API_ROOT, documentId)
    config = serve.get_client(timeline=docRoot+'timeline.xml', layout=docRoot+'layout.json')
    return Response(config, mimetype="application/json")

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/addcallback", methods=["POST"])
def set_callback(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    serve.setCallback(request.args['url'])
    return ''

