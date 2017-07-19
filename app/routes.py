from flask import render_template, abort
from hashlib import sha256

from app import app
from util import hash_file, get_head_revision
import api.routes


BUNDLE_HASH = hash_file("./app/static/dist/bundle.js")
LANDINGPAGE_HASH = hash_file("./app/static/dist/landing_page.js")


@app.route("/")
def landing_page():
    return render_template("landing_page.html", key=BUNDLE_HASH)


@app.route("/editor")
def editor():
    return render_template("editor.html", key=LANDINGPAGE_HASH)


@app.route("/version")
def version():
    return get_head_revision()
