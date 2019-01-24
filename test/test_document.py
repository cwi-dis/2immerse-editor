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
from future import standard_library
standard_library.install_aliases()
import unittest
import urllib.parse
import urllib.request, urllib.parse, urllib.error
import os
import json
import uuid

from . import pretest
from app.api import document

DOCUMENT = """
<testDocument>
    <first>
        <firstChild1/>
        <firstChild2 attr="value"/>
    </first>
    <second><second1 /><second2 /><second3 /></second>
    <third/>
</testDocument>
"""
DOCUMENT_COUNT = 9


class TestDocument(unittest.TestCase):
    def _buildUrl(self, extra=''):
        myUrl = urllib.parse.urljoin(
            u'file:',
            urllib.request.pathname2url(os.path.abspath(__file__))
        )

        docUrl = urllib.parse.urljoin(
            myUrl,
            u"fixtures/test_document%s.xml" % (extra)
        )

        return docUrl

    def test_createDocument(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())
        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_createDocument2(self):
        d = document.Document(uuid.uuid4())
        docUrl = self._buildUrl()
        d.load(docUrl)

        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_saveDocument(self):
        d = document.Document(uuid.uuid4())
        docUrl = self._buildUrl()
        d.load(docUrl)

        newDocUrl = self._buildUrl('_tmp')
        d.save(newDocUrl)

        oldData = urllib.request.urlopen(docUrl).read().strip()
        newData = urllib.request.urlopen(newDocUrl).read().strip()

        self.assertEqual(newData, oldData)

    def test_xpath(self):
        d = document.Document(uuid.uuid4())
        docUrl = self._buildUrl()
        d.load(docUrl)

        for e in d.tree.getroot().iter():
            p = d._getXPath(e)
            e2 = d._getElementByPath(p)

            self.assertIs(e, e2)

    def test_xpath_namespaces(self):
        d = document.Document(uuid.uuid4())
        docUrl = self._buildUrl('_namespaces')
        d.load(docUrl)

        for e in d.tree.getroot().iter():
            p = d._getXPath(e)
            e2 = d._getElementByPath(p)

            self.assertIs(e, e2)


if __name__ == '__main__':
    unittest.main()
