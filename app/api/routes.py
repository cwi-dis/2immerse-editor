from __future__ import absolute_import
from __future__ import unicode_literals
from future import standard_library
standard_library.install_aliases()
from app import app
from .api import api
from flask import Response, request, abort, redirect, jsonify
import json
import os
import urllib.parse
import urllib.request, urllib.parse, urllib.error
from . import globalSettings
from .globalSettings import GlobalSettings
from app import myLogging

myLogging.install(GlobalSettings.noKibana, GlobalSettings.logLevel)


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
def get_docRoot(localPath=API_ROOT):
    protoRP = request.headers.get('X-Forwarded-Proto')

    if protoRP:
        # We are running behind a reverse proxy. Construct base URL manually.
        hostRP = request.headers.get('X-Forwarded-Host')

        # Try the Host header if X-Forwarded-Host is not set
        if not hostRP:
            hostRP = request.headers.get('Host')

        assert hostRP
        docRoot = '%s://%s/' % (protoRP, hostRP)
    else:
        # We are running standalone. Trust http headers.
        docRoot = request.base_url

    if localPath:
        docRoot = urllib.parse.urljoin(docRoot, localPath)

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
    myLogging.install(GlobalSettings.noKibana, GlobalSettings.logLevel)
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
    return Response(json.dumps(rv["events"]), mimetype="application/json")


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


@app.route(API_ROOT + "/document/<uuid:documentId>/events/<id>/enqueue", methods=["POST"])
def document_events_enqueue(documentId, id):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)

    events = document.events()
    assert events

    parameters = request.get_json()
    if not isinstance(parameters, list):
        abort(405)

    return events.enqueue(id, parameters)


@app.route(API_ROOT + "/document/<uuid:documentId>/events/<id>/dequeue", methods=["POST"])
def document_events_dequeue(documentId, id):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)

    events = document.events()
    assert events

    return jsonify({
        "status": events.dequeue(id)
    })


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


@app.route(API_ROOT + "/document/<uuid:documentId>/events/requestbroadcast", methods=["GET"])
def document_request_broadcast(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)

    document.asynch().requestBroadcastToFrontends()

    return ""


#
# per-document, settings and debug links
#
@app.route(API_ROOT + "/document/<uuid:documentId>/settings")
def document_settings_get(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    settings = document.settings()
    assert settings
    rv = settings.get(frontend=get_docRoot("/trigger"), backend=get_docRoot())
    return Response(json.dumps(rv), mimetype="application/json")


@app.route(API_ROOT + "/document/<uuid:documentId>/settings", methods=["PUT"])
def document_settings_put(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    settings = document.settings()
    assert settings

    parameters = request.get_json()
    if not isinstance(parameters, dict):
        abort(405)
    return settings.set(**parameters)


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
# Per-document, editing aspect.
#
@app.route(API_ROOT + "/document/<uuid:documentId>/editing/<string:verb>")
def document_editing_verb(documentId, verb):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    editing = document.editing()
    assert editing
    try:
        func = getattr(editing, verb)
    except AttributeError:
        abort(404)
    kwargs = request.args.to_dict()
    rv = func(**kwargs)
    if isinstance(rv, list) or isinstance(rv, dict):
        return Response(json.dumps(rv), mimetype="application/json")
    return rv
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

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/client.json")
def get_client_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    mode = request.args.get('mode')
    docRoot = '%s/document/%s/serve/' % (get_docRoot(), documentId)
    config = serve.get_client(timeline=docRoot+'timeline.xml', layout=docRoot+'layout.json', base=request.args.get('base'), mode=mode)
    return Response(config, mimetype="application/json")

@app.route(API_ROOT + "/document/<uuid:documentId>/serve/getliveinfo", methods=["GET"])
def get_liveinfo(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    rv = serve.getLiveInfo(contextID=request.args.get('contextID', None))
    return Response(json.dumps(rv), mimetype="application/json")


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


@app.route(API_ROOT + "/document/<uuid:documentId>/serve/gethistory")
def get_history(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    oldest = request.args.get('oldest', None)
    history = serve.gethistory(oldest=oldest)
    return Response(json.dumps(history), mimetype="application/json")

#
# Per-document, serve aspect, for view-only (non-preview-player) consumption of views on the document
#

@app.route(API_ROOT + "/document/<uuid:documentId>/viewer/timeline.xml")
def get_viewer_timeline_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    return Response(serve.get_timeline(viewer=True), mimetype="application/xml")


@app.route(API_ROOT + "/document/<uuid:documentId>/viewer/layout.json")
def get_viewer_layout_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    return Response(serve.get_layout(viewer=True), mimetype="application/json")


@app.route(API_ROOT + "/document/<uuid:documentId>/viewer/client.json")
def get_viewer_client_document(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    mode = request.args.get('mode')
    docRoot = '%s/document/%s/viewer/' % (get_docRoot(), documentId)
    config = serve.get_client(timeline=docRoot+'timeline.xml', layout=docRoot+'layout.json', base=request.args.get('base'), mode=mode, viewer=True)
    return Response(config, mimetype="application/json")

@app.route(API_ROOT + "/document/<uuid:documentId>/viewer/getliveinfo", methods=["GET"])
def get_viewer_liveinfo(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    rv = serve.getLiveInfo(contextID=request.args.get('contextID', None), viewer=True)
    return Response(json.dumps(rv), mimetype="application/json")

@app.route(API_ROOT + "/document/<uuid:documentId>/viewer/gethistory")
def get_viewer_history(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    serve = document.serve()
    assert serve
    oldest = request.args.get('oldest', None)
    history = serve.gethistory(oldest=oldest, viewer=True)
    return Response(json.dumps(history), mimetype="application/json")


@app.route(API_ROOT + "/document/<uuid:documentId>/viewer")
def get_viewer_preview(documentId):
    clientDocUrl = get_docRoot() + "/document/%s/viewer/client.json" % documentId
    clientArgs = {}
    if 'base' in request.args:
        clientArgs['base'] = request.args['base']
    if 'mode' in request.args:
        clientArgs['mode'] = request.args['mode']
    if clientArgs:
        clientDocUrl += '?' + urllib.parse.urlencode(clientArgs)
    clientApiUrl = "%s#?inputDocument=%s" % (GlobalSettings.clientApiUrl, clientDocUrl)
    return redirect(clientApiUrl)


#
# Preview player redirect
#

@app.route(API_ROOT + "/document/<uuid:documentId>/preview")
def get_preview(documentId):
    clientDocUrl = get_docRoot() + "/document/%s/serve/client.json" % documentId
    clientArgs = {}
    if 'base' in request.args:
        clientArgs['base'] = request.args['base']
    if 'mode' in request.args:
        clientArgs['mode'] = request.args['mode']
    if clientArgs:
        clientDocUrl += '?' + urllib.parse.urlencode(clientArgs)
    clientApiUrl = "%s#?inputDocument=%s" % (GlobalSettings.clientApiUrl, clientDocUrl)
    return redirect(clientApiUrl)


short_urls = []


@app.route("/shorturl/<int:id>", methods=["GET"])
def expand_shorturl(id):
    if id >= len(short_urls):
        abort(400, "ID not found")
    newUrl = short_urls[id]
    if 'mode' in request.args:
        newUrl += '?' + urllib.parse.urlencode(dict(mode=mode))
    return redirect(short_urls[id])


@app.route("/shorturl", methods=["POST"])
def generate_shorturl():
    data = request.get_json()

    if not data or "longUrl" not in data:
        abort(400, "Parameter 'longUrl' missing or wrong content type")

    if data["longUrl"] in short_urls:
        return jsonify({"id": short_urls.index(data["longUrl"])})
    else:
        short_urls.append(data["longUrl"])

        return jsonify({"id": len(short_urls) - 1})
