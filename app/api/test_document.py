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
 
if __name__ == '__main__':
    unittest.main()
    
