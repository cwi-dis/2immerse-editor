import sys
from flask import Flask

app = Flask(__name__)
app.config.from_object("config")

from app import routes

import util

def print_version(out=sys.stderr):
    branch = 'unknown'
    revision = 'unknown'
    try:
        branch, revision = util.get_head_revision()
    except IOError:
        pass
    print >>out, '2immerse authoring tool backend, branch', branch, 'revision', revision

print_version()
