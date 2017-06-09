from flask import render_template, abort
from app import app
from api import api

@app.route("/")
def main():
    return render_template("main.html")

@app.route("/api/v1/<string:verb>")
def api_verb(verb):
    try:
        func = getattr(api, verb)
    except AttributeError:
        abort(404)
    return func()
    
@app.route("/api/v1/document", methods=["GET", "POST"])
def document():
    return api.document()
    
@app.route("/api/v1/document/<uuid:documentId>", methods=["GET", "PUT"])
def document_instance(documentId):
    try:
        document = api.documents[documentId]
    except KeyError:
        abort(404)
    return document.index()
    
@app.route("/api/v1/document/<uuid:documentId>/<string:verb>")
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
    
