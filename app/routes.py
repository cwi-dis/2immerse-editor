from flask import render_template, abort
from app import app
import api.routes


@app.route("/")
def landing_page():
    return render_template("landing_page.html")


@app.route("/editor")
def editor():
    return render_template("editor.html")
