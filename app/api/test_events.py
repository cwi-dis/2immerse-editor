import unittest
import document
import urllib
import urlparse
import os
import json


class Test(unittest.TestCase):

    def _buildUrl(self, extra=''):
        myUrl = urlparse.urljoin('file:', urllib.pathname2url(os.path.abspath(__file__)))
        docUrl = urlparse.urljoin(myUrl, 'test_events%s.xml'%extra)
        return docUrl
        
    def _createDocument(self):
        d = document.Document()
        docUrl = self._buildUrl()
        d.load(docUrl)
        return d
        
    def test_get(self):
        d = self._createDocument()
        oldCount = d._count()
        e = d.events()
        allEvents = e.get()
        self.assertEqual(len(allEvents), 4)
        self.assertEqual(d._count(), oldCount)
        
    def test_trigger(self):  
        d = self._createDocument()
        oldCount = d._count()
        e = d.events()

        newId = e.trigger('event1', [])
        self.assertTrue(newId)
        self.assertNotEqual(newId, 'event1')
        self.assertEqual(d._count(), oldCount + 3)
        newId2 = e.trigger('event1', [])
        self.assertTrue(newId2)
        self.assertNotEqual(newId2, 'event1')
        self.assertNotEqual(newId2, newId)
        self.assertEqual(d._count(), oldCount + 6)
        
        newDocUrl = self._buildUrl('_aftertrigger_tmp')
        goodDocUrl = self._buildUrl('_aftertrigger')
        d.save(newDocUrl)
        oldData = urllib.urlopen(goodDocUrl).read()
        newData = urllib.urlopen(newDocUrl).read()
        self.assertEqual(newData, oldData)        
        
    def test_modify(self):
        d = self._createDocument()
        oldCount = d._count()
        e = d.events()

        e.modify('event4', [])
        self.assertEqual(d._count(), oldCount)

        newDocUrl = self._buildUrl('_aftermodify_tmp')
        goodDocUrl = self._buildUrl('_aftermodify')
        d.save(newDocUrl)
        oldData = urllib.urlopen(goodDocUrl).read()
        newData = urllib.urlopen(newDocUrl).read()
        self.assertEqual(newData, oldData)

if __name__ == '__main__':
    unittest.main()
    
