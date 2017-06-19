import unittest
import document
import urllib
import urlparse
import os
import json

DOCUMENT="""
<testDocument>
    <first>
        <firstChild1/>
        <firstChild2 attr="value"/>
    </first>
    <second>
    </second>
    <third>
    </third>
</testDocument>
"""

class Test(unittest.TestCase):

    def test_createDocument(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        self.assertEquals(d._count(), 6)
        
    def test_createDocument2(self):
        d = document.Document()
        myUrl = urlparse.urljoin('file:', urllib.pathname2url(os.path.abspath(__file__)))
        docUrl = urlparse.urljoin(myUrl, 'test_document.xml')
        d.load(docUrl)
        self.assertEquals(d._count(), 6)
        
    def SKIP_test_get_xml_absolute(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        result = d.get('/testDocument/first/firstChild2', 'application/xml')
        self.assertEquals(result.strip(), '<firstChild2 attr="value"/>')
        self.assertEquals(d._count(), 6)
        
    def test_get_xml(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        result = d.get('first/firstChild2', 'application/xml')
        self.assertEquals(result.strip(), '<firstChild2 attr="value" />')
        self.assertEquals(d._count(), 6)
        
    def test_get_json(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        result = d.get('first/firstChild2', 'application/json')
        result = json.loads(result)
        self.assertEquals(result, dict(attr="value"))
        self.assertEquals(d._count(), 6)
        
    def test_put_xml(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        path = d.paste('third', 'begin', None, '<thirdChild><thirdGrandChild depth="3" /></thirdChild>', 'application/xml')
        self.assertEquals(d._count(), 8)
        self.assertEquals(path, 'third/thirdChild')
        grandData = d.get('third/thirdChild/thirdGrandChild', 'application/json')
        grandData = json.loads(grandData)
        self.assertEquals(grandData, dict(depth="3"))
        
    def test_put_json(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        path = d.paste('third', 'begin', 'thirdChild', '{"depth":"2"}', 'application/json')
        self.assertEquals(d._count(), 7)
        self.assertEquals(path, 'third/thirdChild')
        grandData = d.get('third/thirdChild', 'application/json')
        grandData = json.loads(grandData)
        self.assertEquals(grandData, dict(depth="2"))

if __name__ == '__main__':
    unittest.main()
    
