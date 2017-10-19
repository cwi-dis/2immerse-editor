from app import app
from api import api
from flask import Response, request, abort, redirect, jsonify
import json
import os
import urlparse
import urllib
import globalSettings
from app import myLogging

myLogging.install(globalSettings.noKibana, globalSettings.logLevel)

#
# Disable CORS problems
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if request.method == 'OPTIONS':
        response.headers['Access-Control-Allow-Methods'] = 'DELETE, GET, POST, PUT'
        headers = request.headers.get('Access-Control-Request-Headers')
        if headers:
            response.headers['Access-Control-Allow-Headers'] = headers
    return response
app.after_request(add_cors_headers)

API_ROOT = '/api/v1'

#
# Get externally accessible URL for an endpoint. Only call while inside a request.
#
def get_docRoot():
    protoRP = request.headers.get('X-Forwarded-Proto')
    if protoRP:
        # We are running behind a reverse proxy. Construct base URL manually.
        hostRP = request.headers.get('X-Forwarded-Host')
        assert hostRP
        docRoot = '%s://%s%s' % (protoRP, hostRP, API_ROOT)
    else:
        # We are running standalone. Trust http headers.
        docRoot = urlparse.urljoin(request.base_url, API_ROOT)
    return docRoot


def handle_error(code, status, error):
    response = jsonify({"message": error.description})
    response.status = status

    return response, code


@app.errorhandler(400)
def handle_400(error):
    return handle_error(400, "Bad Request", error)


@app.errorhandler(404)
def handle_404(error):
    return handle_error(404, "Not Found", error)


@app.errorhandler(405)
def handle_405(error):
    return handle_error(405, "Method Not Allowed", error)


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

@app.route(API_ROOT + "/configuration", methods=["GET"])
def get_configuration():
    return json.dumps(globalSettings._get())+'\n'

@app.route(API_ROOT + "/configuration", methods=["PUT"])
def put_configuration():
    globalSettings._put(request.get_json())
    myLogging.install(globalSettings.noKibana, globalSettings.logLevel)
    return 'OK\n'

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

@app.route(API_ROOT + "/document/<uuid:documentId>", methods=["DELETE"])
def delete_document(documentId):
    try:
        del api.documents[documentId]
    except KeyError:
        abort(404)

    return ""

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
    if not isinstance(parameters, list):
        abort(405)

    return events.trigger(id, parameters)


@app.route(API_ROOT + "/document/<uuid:documentId>/events/<id>/modify", methods=["PUT"])
def document_events_modify(documentId, id):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)

    events = document.events()
    assert events

    parameters = request.get_json()
    if not isinstance(parameters, list):
        abort(405)

    return events.modify(id, parameters)

#
# per-document, remote control of playback
#
@app.route(API_ROOT + "/document/<uuid:documentId>/remote")
def document_remote_get(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    remote = document.remote()
    assert remote
    rv = remote.get()
    return Response(json.dumps(rv), mimetype="application/json")

@app.route(API_ROOT + "/document/<uuid:documentId>/remote/control", methods=["POST"])
def document_remote_control(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    remote = document.remote()
    assert remote
    command = request.get_json()
    rv = remote.get()
    return remote.control(command)

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
    docRoot = '%s/document/%s/serve/' % (get_docRoot(), documentId)
    config = serve.get_client(timeline=docRoot+'timeline.xml', layout=docRoot+'layout.json', base=request.args.get('base'))
    return Response(config, mimetype="application/json")

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/layout.json", methods=["PUT"])
def put_client_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    clientJSON = request.get_data()  # Gets raw data, without parsing
    _ = json.loads(clientJSON)  # Assure it is actually json
    serve.put_client(clientJSON)
    return ''

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/addcallback", methods=["POST"])
def set_callback(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    serve.setCallback(url=request.args.get('url'), contextID=request.args.get('contextID', None))
    return ''

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/updatedocstate", methods=["PUT"])
def update_document_state(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    documentState = request.get_json()
    if not isinstance(documentState, dict):
        abort(405)
    serve.setDocumentState(documentState)
    return ''

#
# Preview player redirect
#

@app.route(API_ROOT + "/document/<uuid:documentId>/preview")
def get_preview(documentId):
    clientDocUrl = get_docRoot() + "/document/%s/serve/client.json" % documentId
    base = request.args.get('base')
    if base:
        clientDocUrl += '?' + urllib.urlencode(dict(base=base))
    clientApiUrl = "%s#?inputDocument=%s" % (globalSettings.clientApiUrl, clientDocUrl)
    return redirect(clientApiUrl)


