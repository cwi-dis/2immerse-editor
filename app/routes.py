from flask import render_template
from app import app
from api import api

@app.route("/")
def main():
    return render_template("main.html")

@app.route("/api/v1/<verb>")
def call_api(verb):
    func = getattr(api, verb)
    return func()
    
