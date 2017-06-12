from flask import render_template, abort
from app import app
import api.routes

@app.route("/")
def main():
    return render_template("main.html")

