from app import app, db


@app.route("/")
def main():
    return "Hello World"
