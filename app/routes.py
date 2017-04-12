from flask import render_template
from app import app, db


@app.route("/")
def main():
    return render_template("main.html")
