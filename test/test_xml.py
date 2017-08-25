import sys
from os.path import dirname, join, realpath

sys.path.append(join(dirname(realpath(__file__)), "../app/api"))

import unittest
import document
import urlparse
import urllib
import os
import json
import uuid

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


class TestXML(unittest.TestCase):
    def _buildUrl(self, extra=''):
        myUrl = urlparse.urljoin(
            'file:', urllib.pathname2url(os.path.abspath(__file__))
        )

        docUrl = urlparse.urljoin(
            myUrl,
            "fixtures/test_document%s.xml" % (extra)
        )

        return docUrl

    @unittest.skip("skip get_xml_absolute")
    def test_get_xml_absolute(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())

        result = d.get('/testDocument/first/firstChild2', 'application/xml')

        self.assertEqual(result.strip(), '<firstChild2 attr="value"/>')
        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_get_xml(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())
        x = d.xml()

        result = x.get('first/firstChild2', 'application/xml')
        self.assertEqual(result.strip(), '<firstChild2 attr="value" />')
        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_get_json(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())
        x = d.xml()

        result = x.get('first/firstChild2', 'application/json')
        result = json.loads(result)

        self.assertEqual(result, dict(attr="value"))
        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_put_xml(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())
        x = d.xml()

        path = x.paste(
            'third', 'begin', None,
            '<thirdChild><thirdGrandChild depth="3" /></thirdChild>',
            'application/xml'
        )
        self.assertEqual(d._count(), DOCUMENT_COUNT+2)
        self.assertEqual(path, '/testDocument/third[1]/thirdChild[1]')

        grandData = x.get(
            'third/thirdChild/thirdGrandChild',
            'application/json'
        )
        grandData = json.loads(grandData)

        self.assertEqual(grandData, dict(depth="3"))

    def test_put_json(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())
        x = d.xml()

        path = x.paste(
            'third', 'begin', 'thirdChild', '{"depth":"2"}', 'application/json'
        )
        self.assertEqual(d._count(), DOCUMENT_COUNT + 1)
        self.assertEqual(path, '/testDocument/third[1]/thirdChild[1]')

        grandData = x.get('third/thirdChild', 'application/json')
        grandData = json.loads(grandData)

        self.assertEqual(grandData, dict(depth="2"))

    def test_put_where(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())
        x = d.xml()

        path = x.paste('third', 'begin', 'third3', '{}', 'application/json')
        x.paste(path, 'before', 'third2', '{}', 'application/json')
        x.paste(path, 'after', 'third4', '{}', 'application/json')
        x.paste('third', 'begin', 'third1', '{}', 'application/json')
        x.paste('third', 'end', 'third5', '{}', 'application/json')

        self.assertEqual(d._count(), DOCUMENT_COUNT+5)

        thirdData = x.get('third', 'application/xml')
        thirdData = thirdData.strip()

        self.assertEqual(
            thirdData,
            '<third><third1 /><third2 /><third3 /><third4 /><third5 /></third>'
        )

    def test_move(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())
        x = d.xml()

        newpath = x.move('second/second2', 'before', 'second/second3')
        self.assertEqual(newpath, '/testDocument/second[1]/second3[1]')

        newpath = x.move('second/second2', 'after', 'second/second1')
        self.assertEqual(newpath, '/testDocument/second[1]/second1[1]')

        secondData = x.get('second', 'application/xml')
        secondData = secondData.strip()

        self.assertEqual(
            secondData,
            '<second><second3 /><second2 /><second1 /></second>'
        )
        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_copy(self):
        d = document.Document(uuid.uuid4())
        d.loadXml(DOCUMENT.strip())
        x = d.xml()

        newpath = x.copy('second/second2', 'before', 'second/second3')
        self.assertEqual(newpath, '/testDocument/second[1]/second3[1]')

        newpath = x.copy('second/second2', 'after', 'second/second1')
        self.assertEqual(newpath, '/testDocument/second[1]/second1[2]')

        secondData = x.get('second', 'application/xml')
        secondData = secondData.strip()

        self.assertEqual(
            secondData,
            "<second><second1 /><second3 /><second2 /><second1 /><second3 /></second>"
        )
        self.assertEqual(d._count(), DOCUMENT_COUNT + 2)


if __name__ == '__main__':
    unittest.main()
