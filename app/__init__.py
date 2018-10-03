from __future__ import print_function
from __future__ import absolute_import
from __future__ import unicode_literals
import sys
import platform
from flask import Flask

app = Flask(__name__)
app.config.from_object("config")

from app import routes
from . import util


def print_version(out=sys.stderr):
    branch = 'unknown'
    revision = 'unknown'
    try:
        branch, revision = util.get_head_revision()
    except IOError:
        pass
    print('2immerse authoring tool backend, branch %s, revision %s, python %s' % (branch, revision, platform.python_version()), file=out)

print_version()
