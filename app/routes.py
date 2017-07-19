from flask import render_template, abort
from hashlib import sha256

from app import app
import api.routes


def hash_file(path):
    h = sha256()

    with open(path, 'rb') as f:
        while True:
            data = f.read(2**16)

            if not data:
                break

            h.update(data)

    return h.hexdigest()


@app.route("/")
def landing_page():
    return render_template("landing_page.html")


@app.route("/editor")
def editor():
    return render_template("editor.html")
