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
import urllib.request, urllib.parse, urllib.error
import urllib.parse
import os
import json
import uuid

from . import pretest
from app.api import document


class TestEvents(unittest.TestCase):
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

    def test_get(self):
        d = self._createDocument()
        oldCount = d._count()

        e = d.events()
        allEvents = e.get()["events"]

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

        oldData = urllib.request.urlopen(goodDocUrl).read().strip()
        newData = urllib.request.urlopen(newDocUrl).read().strip()

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

        oldData = urllib.request.urlopen(goodDocUrl).read().strip()
        newData = urllib.request.urlopen(newDocUrl).read().strip()

        self.assertEqual(newData, oldData)

    def test_triggerParameter(self):
        d = self._createDocument()
        oldCount = d._count()
        e = d.events()

        newId = e.trigger(
            'event2',
            [dict(parameter='./tl:sleep/@tl:dur', value='42')]
        )

        self.assertTrue(newId)
        self.assertNotEqual(newId, 'event2')
        self.assertEqual(d._count(), oldCount + 5)

        newDocUrl = self._buildUrl('_aftertriggerparameter_tmp')
        goodDocUrl = self._buildUrl('_aftertriggerparameter')
        d.save(newDocUrl)

        oldData = urllib.request.urlopen(goodDocUrl).read().strip()
        newData = urllib.request.urlopen(newDocUrl).read().strip()

        self.assertEqual(newData, oldData)

    def test_modifyParameter(self):
        d = self._createDocument()
        oldCount = d._count()
        e = d.events()

        newId = e.trigger('event3', [dict(parameter='./tl:sleep/@tl:dur', value='42')])
        self.assertTrue(newId)
        self.assertNotEqual(newId, 'event3')
        self.assertEqual(d._count(), oldCount + 7)

        e.modify(newId, [dict(parameter='./tl:sleep/@tl:dur', value='0')])
        newDocUrl = self._buildUrl('_aftermodifyparameter_tmp')
        goodDocUrl = self._buildUrl('_aftermodifyparameter')
        d.save(newDocUrl)

        oldData = urllib.request.urlopen(goodDocUrl).read().strip()
        newData = urllib.request.urlopen(newDocUrl).read().strip()
        self.assertEqual(newData, oldData)


if __name__ == '__main__':
    unittest.main()
