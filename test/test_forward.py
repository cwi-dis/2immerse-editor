from __future__ import absolute_import
from future import standard_library
standard_library.install_aliases()
import unittest
import urllib.request, urllib.parse, urllib.error
import urllib.parse
import os
import json
import uuid

import pretest
from app.api import document


class TestForward(unittest.TestCase):
    def _buildUrl(self, extra=''):
        myUrl = urllib.parse.urljoin(
            u'file:', urllib.request.pathname2url(os.path.abspath(__file__))
        )

        docUrl = urllib.parse.urljoin(
            myUrl,
            u"fixtures/test_events%s.xml" % (extra)
        )

        return docUrl

    def _createDocument(self):
        d = document.Document(uuid.uuid4())
        d.setTestMode(True)
        docUrl = self._buildUrl()
        d.load(docUrl)

        return d

    def test_create(self):
        d = self._createDocument()
        dCopy = self._createDocument()
        d.forwardHandler = dCopy
        self.assertEqual(d._count(), dCopy._count())

        newDocUrl = self._buildUrl('_forward_create_tmp')
        copyDocUrl = self._buildUrl('_forward_create_copy_tmp')
        d.save(newDocUrl)
        dCopy.save(copyDocUrl)

        newData = urllib.request.urlopen(newDocUrl).read()
        copyData = urllib.request.urlopen(copyDocUrl).read()

        self.assertEqual(newData, copyData)

    def test_trigger(self):
        d = self._createDocument()
        dCopy = self._createDocument()
        d.forwardHandler = dCopy
        oldCount = d._count()
        e = d.events()

        newId = e.trigger('event1', [])
        self.assertTrue(newId)
        self.assertNotEqual(newId, 'event1')
        self.assertEqual(d._count(), oldCount + 3)
        self.assertEqual(dCopy._count(), oldCount + 3)

        newId2 = e.trigger('event1', [])
        self.assertTrue(newId2)
        self.assertNotEqual(newId2, 'event1')
        self.assertNotEqual(newId2, newId)
        self.assertEqual(d._count(), oldCount + 6)
        self.assertEqual(dCopy._count(), oldCount + 6)

        newDocUrl = self._buildUrl('_forward_trigger_tmp')
        copyDocUrl = self._buildUrl('_forward_trigger_copy_tmp')
        d.save(newDocUrl)
        dCopy.save(copyDocUrl)

        newData = urllib.request.urlopen(newDocUrl).read()
        copyData = urllib.request.urlopen(copyDocUrl).read()

        self.assertEqual(newData, copyData)

    def test_modify(self):
        d = self._createDocument()
        dCopy = self._createDocument()
        d.forwardHandler = dCopy
        oldCount = d._count()
        e = d.events()

        e.modify('event4', [])
        self.assertEqual(d._count(), oldCount)
        self.assertEqual(dCopy._count(), oldCount)

        newDocUrl = self._buildUrl('_forward_modify_tmp')
        copyDocUrl = self._buildUrl('_forward_modify_copy_tmp')
        d.save(newDocUrl)
        dCopy.save(copyDocUrl)

        newData = urllib.request.urlopen(newDocUrl).read()
        copyData = urllib.request.urlopen(copyDocUrl).read()

        self.assertEqual(newData, copyData)

    def test_triggerParameter(self):
        d = self._createDocument()
        dCopy = self._createDocument()
        d.forwardHandler = dCopy
        oldCount = d._count()
        e = d.events()

        newId = e.trigger(
            'event2',
            [dict(parameter='./tl:sleep/@tl:dur', value='42')]
        )
        self.assertTrue(newId)
        self.assertNotEqual(newId, 'event2')
        self.assertEqual(d._count(), oldCount + 5)
        self.assertEqual(dCopy._count(), oldCount + 5)

        newDocUrl = self._buildUrl('_forward_triggerParameter_tmp')
        copyDocUrl = self._buildUrl('_forward_triggerParameter_copy_tmp')
        d.save(newDocUrl)
        dCopy.save(copyDocUrl)

        newData = urllib.request.urlopen(newDocUrl).read()
        copyData = urllib.request.urlopen(copyDocUrl).read()

        self.assertEqual(newData, copyData)

    def test_modifyParameter(self):
        d = self._createDocument()
        dCopy = self._createDocument()
        d.forwardHandler = dCopy
        oldCount = d._count()
        e = d.events()

        newId = e.trigger('event3', [dict(parameter='./tl:sleep/@tl:dur', value='42')])
        self.assertTrue(newId)
        self.assertNotEqual(newId, 'event3')
        self.assertEqual(d._count(), oldCount + 7)
        self.assertEqual(dCopy._count(), oldCount + 7)

        e.modify(newId, [dict(parameter='./tl:sleep/@tl:dur', value='0')])
        newDocUrl = self._buildUrl('_forward_modifyParameter_tmp')
        copyDocUrl = self._buildUrl('_forward_modifyParameter_copy_tmp')
        d.save(newDocUrl)
        dCopy.save(copyDocUrl)

        newData = urllib.request.urlopen(newDocUrl).read()
        copyData = urllib.request.urlopen(copyDocUrl).read()

        self.assertEqual(newData, copyData)


if __name__ == '__main__':
    unittest.main()
