import sys
from os.path import dirname, join, realpath

sys.path.append(join(dirname(realpath(__file__)), "../app/api"))

import unittest
import document
import urlparse
import urllib
import os
import json

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


class Test(unittest.TestCase):
    def _buildUrl(self, extra=''):
        myUrl = urlparse.urljoin(
            'file:',
            urllib.pathname2url(os.path.abspath(__file__))
        )
        docUrl = urlparse.urljoin(myUrl, 'test_document%s.xml' % (extra))

        return docUrl

    def test_createDocument(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_createDocument2(self):
        d = document.Document()
        docUrl = self._buildUrl()
        d.load(docUrl)
        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_saveDocument(self):
        d = document.Document()
        docUrl = self._buildUrl()
        d.load(docUrl)
        newDocUrl = self._buildUrl('_tmp')
        d.save(newDocUrl)
        oldData = urllib.urlopen(docUrl).read().strip()
        newData = urllib.urlopen(newDocUrl).read().strip()
        self.assertEqual(newData, oldData)

    def test_xpath(self):
        d = document.Document()
        docUrl = self._buildUrl()
        d.load(docUrl)
        for e in d.tree.getroot().iter():
            p = d._getXPath(e)
            e2 = d._getElement(p)
            self.assertIs(e, e2)

    def test_xpath_namespaces(self):
        d = document.Document()
        docUrl = self._buildUrl('_namespaces')
        d.load(docUrl)
        for e in d.tree.getroot().iter():
            p = d._getXPath(e)
            e2 = d._getElement(p)
            self.assertIs(e, e2)


if __name__ == '__main__':
    unittest.main()
