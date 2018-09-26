from __future__ import unicode_literals
from gevent.pywsgi import WSGIServer
from app import app

if __name__ == "__main__":
    WSGIServer(("0.0.0.0", 8000), app).serve_forever()
