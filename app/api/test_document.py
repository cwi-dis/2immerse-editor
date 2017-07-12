import unittest
import document
import urlparse
import urllib
import os
import json

DOCUMENT="""
<testDocument>
    <first>
        <firstChild1/>
        <firstChild2 attr="value"/>
    </first>
    <second><second1 /><second2 /><second3 /></second>
    <third/>
</testDocument>
"""
DOCUMENT_COUNT=9

class Test(unittest.TestCase):

    def _buildUrl(self, extra=''):
        myUrl = urlparse.urljoin('file:', urllib.pathname2url(os.path.abspath(__file__)))
        docUrl = urlparse.urljoin(myUrl, 'test_document%s.xml'%extra)
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
        oldData = urllib.urlopen(docUrl).read()
        newData = urllib.urlopen(newDocUrl).read()
        self.assertEqual(newData, oldData)
        
    def SKIP_test_get_xml_absolute(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        result = d.get('/testDocument/first/firstChild2', 'application/xml')
        self.assertEqual(result.strip(), '<firstChild2 attr="value"/>')
        self.assertEqual(d._count(), DOCUMENT_COUNT)
        
    def test_get_xml(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        result = d.get('first/firstChild2', 'application/xml')
        self.assertEqual(result.strip(), '<firstChild2 attr="value" />')
        self.assertEqual(d._count(), DOCUMENT_COUNT)
        
    def test_get_json(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        result = d.get('first/firstChild2', 'application/json')
        result = json.loads(result)
        self.assertEqual(result, dict(attr="value"))
        self.assertEqual(d._count(), DOCUMENT_COUNT)
        
    def test_put_xml(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        path = d.paste('third', 'begin', None, '<thirdChild><thirdGrandChild depth="3" /></thirdChild>', 'application/xml')
        self.assertEqual(d._count(), DOCUMENT_COUNT+2)
        self.assertEqual(path, 'third/thirdChild')
        grandData = d.get('third/thirdChild/thirdGrandChild', 'application/json')
        grandData = json.loads(grandData)
        self.assertEqual(grandData, dict(depth="3"))
        
    def test_put_json(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        path = d.paste('third', 'begin', 'thirdChild', '{"depth":"2"}', 'application/json')
        self.assertEqual(d._count(), DOCUMENT_COUNT+1)
        self.assertEqual(path, 'third/thirdChild')
        grandData = d.get('third/thirdChild', 'application/json')
        grandData = json.loads(grandData)
        self.assertEqual(grandData, dict(depth="2"))
        
    def test_put_where(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        path = d.paste('third', 'begin', 'third3', '{}', 'application/json')
        d.paste(path, 'before', 'third2', '{}', 'application/json')
        d.paste(path, 'after', 'third4', '{}', 'application/json')
        d.paste('third', 'begin', 'third1', '{}', 'application/json')
        d.paste('third', 'end', 'third5', '{}', 'application/json')
        self.assertEqual(d._count(), DOCUMENT_COUNT+5)
        thirdData = d.get('third', 'application/xml')
        thirdData = thirdData.strip()
        self.assertEqual(thirdData, '<third><third1 /><third2 /><third3 /><third4 /><third5 /></third>')
        
    def test_move(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        newpath = d.move('second/second2', 'before', 'second/second3')
        self.assertEqual(newpath, 'second/second3')
        newpath = d.move('second/second2', 'after', 'second/second1')
        self.assertEqual(newpath, 'second/second1')
        secondData = d.get('second', 'application/xml')
        secondData = secondData.strip()
        self.assertEqual(secondData, '<second><second3 /><second2 /><second1 /></second>')
        self.assertEqual(d._count(), DOCUMENT_COUNT)

    def test_copy(self):
        d = document.Document()
        d.loadXml(DOCUMENT.strip())
        newpath = d.copy('second/second2', 'before', 'second/second3')
        self.assertEqual(newpath, 'second/second3')
        newpath = d.copy('second/second2', 'after', 'second/second1')
        self.assertEqual(newpath, 'second/second1[2]')
        secondData = d.get('second', 'application/xml')
        secondData = secondData.strip()
        self.assertEqual(secondData, '<second><second1 /><second3 /><second2 /><second1 /><second3 /></second>')
        self.assertEqual(d._count(), DOCUMENT_COUNT+2)
        
        

if __name__ == '__main__':
    unittest.main()
    