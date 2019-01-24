"""Copyright 2018 Centrum Wiskunde & Informatica

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
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
