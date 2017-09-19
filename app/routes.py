from flask import render_template, abort, jsonify
from hashlib import sha256

from app import app
from util import hash_file, get_head_revision
import api.routes


EDITOR_HASH = hash_file("./app/static/dist/editor.js")
TRIGGER_HASH = hash_file("./app/static/dist/trigger.js")
LANDINGPAGE_HASH = hash_file("./app/static/dist/landing_page.js")


@app.route("/")
def landing_page():
    return render_template(
        "main.html",
        filename="landing_page.js", key=LANDINGPAGE_HASH
    )


@app.route("/editor")
def editor():
    return render_template(
        "main.html",
        filename="editor.js", key=EDITOR_HASH
    )


@app.route("/trigger")
def trigger():
    return render_template(
        "main.html",
        filename="trigger.js", key=TRIGGER_HASH
    )


@app.route("/version")
def version():
    try:
        return jsonify(get_head_revision())
    except:
        return "Could not determine HEAD revision"


@app.route("/healthcheck")
def healthcheck():
    return ("", 204)
