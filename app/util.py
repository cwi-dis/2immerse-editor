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
from __future__ import absolute_import
from __future__ import unicode_literals
from hashlib import sha256
from .api.globalSettings import GlobalSettings


def hash_file(path):
    h = sha256()

    with open(path, 'rb') as f:
        while True:
            data = f.read(2**16)

            if not data:
                break

            h.update(data)

    return h.hexdigest()


def get_current_branch():
    try:
        with open("./.git/HEAD", "r") as headfile:
            return headfile.read().strip().split("/")[-1]
    except:
        raise IOError("Could not determine branch")


def get_head_revision():
    try:
        branch = get_current_branch()

        with open("./.git/refs/heads/" + branch, "r") as revfile:
            return branch, revfile.read().strip()
    except:
        with open("./REVISION", "r") as revfile:
            [branch, revision] = revfile.read().strip().split("/")

            if not revision or not branch:
                raise IOError("Could not determine revision")

            return branch, revision
