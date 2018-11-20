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


class TestEditing(unittest.TestCase):
    def _buildUrl(self, extra=''):
        myUrl = urllib.parse.urljoin(
            u'file:', urllib.request.pathname2url(os.path.abspath(__file__))
        )

        docUrl = urllib.parse.urljoin(
            myUrl,
            u"fixtures/test_editing%s.xml" % (extra)
        )

        return docUrl

    def _createDocument(self):
        d = document.Document(uuid.uuid4())
        d.setTestMode(True)
        docUrl = self._buildUrl()
        d.load(docUrl)

        return d

    def test_getChapters(self):
        d = self._createDocument()
        
        e = d.editing()
        chapter = e.getChapters()
        self.assertEqual(chapter['id'], 'rootchapterid')
        self.assertEqual(len(chapter['chapters']), 1)
        self.assertEqual(chapter['chapters'][0]['id'], 'subchapterid')

    def test_getChapters(self):
        d = self._createDocument()
        
        e = d.editing()
        chapter = e.getChapters()
        self.assertEqual(chapter['id'], 'rootchapterid')
        self.assertEqual(len(chapter['chapters']), 1)
        self.assertEqual(chapter['chapters'][0]['id'], 'subchapterid')

    def test_getChapter(self):
        d = self._createDocument()
        
        e = d.editing()
        chapter = e.getChapter('rootchapterid')
        print('xxxjack', chapter)
        self.assertEqual(chapter['id'], 'rootchapterid')
        self.assertEqual(len(chapter['tracks']), 1)
        self.assertEqual(chapter['tracks'][0]['id'], 'trackid')
        self.assertEqual(chapter['tracks'][0]['elements'][0]['asset'], 'assetid')

    def test_getLayout(self):
        d = self._createDocument()
        
        e = d.editing()
        layout = e.getLayout()
        self.assertEqual(len(layout['devices']), 1)
        self.assertEqual(len(layout['regions']), 1)

    def test_getAssets(self):
        d = self._createDocument()
        
        e = d.editing()
        assets = e.getAssets()
        self.assertEqual(len(assets), 1)
        self.assertEqual(assets[0]['id'], 'assetid')
        
    def test_addChapterBefore(self):
        d = self._createDocument()
        e = d.editing()
        oldCount = d._count()
        rootChapter = e.getChapters()
        subChapterId = rootChapter['chapters'][0]['id']
        newId = e.addChapterBefore(subChapterId)
        rootChapter = e.getChapters()
        self.assertEqual(len(chapter['chapters']), 2)
        self.assertEqual(chapter['chapters'][0]['id'], newId)

    def test_addChapterAfter(self):
        d = self._createDocument()
        e = d.editing()
        oldCount = d._count()
        rootChapter = e.getChapters()
        subChapterId = rootChapter['chapters'][0]['id']
        newId = e.addChapterAfter(subChapterId)
        rootChapter = e.getChapters()
        self.assertEqual(len(chapter['chapters']), 2)
        self.assertEqual(chapter['chapters'][1]['id'], newId)

    def test_addSubChapter(self):
        d = self._createDocument()
        e = d.editing()
        oldCount = d._count()
        rootChapter = e.getChapters()
        subChapterId = rootChapter['chapters'][0]['id']
        newId = e.addSubChapter(subChapterId)
        rootChapter = e.getChapters()
        self.assertEqual(len(chapter['chapters'][0]['chapters']), 1)
        self.assertEqual(chapter['chapters'][0]['chapters'][0]['id'], newId)

    def test_renameChapter(self):
        d = self._createDocument()
        e = d.editing()
        oldCount = d._count()
        rootChapter = e.getChapters()
        subChapterId = rootChapter['chapters'][0]['id']
        newId = e.addSubChapter(subChapterId)
        e.renameChapter(newId, 'Try Renaming')
        rootChapter = e.getChapters()
        self.assertEqual(len(chapter['chapters'][0]['chapters']), 1)
        self.assertEqual(chapter['chapters'][0]['chapters'][0]['name'], 'Try Renaming')

    def test_deleteChapter(self):
        d = self._createDocument()
        e = d.editing()
        oldCount = d._count()
        rootChapter = e.getChapters()
        subChapterId = rootChapter['chapters'][0]['id']
        newId = e.addSubChapter(subChapterId)
        e.deleteChapter(subChapterId)
        rootChapter = e.getChapters()
        self.assertEqual(len(chapter['chapters']), 0)

    def test_addTrack(self):
        d = self._createDocument()
        e = d.editing()
        oldCount = d._count()
        rootChapter = e.getChapters()
        subChapterId = rootChapter['chapters'][0]['id']
        trackId = e.addTrack(subChapterId, 'regionid')
        rootChapter = e.getChapters()
        self.assertEqual(len(chapter['chapters'][0]['tracks']), 1)
        self.assertEqual(chapter['chapters'][0]['tracks'][0]['id'], trackId)
        self.assertEqual(chapter['chapters'][0]['tracks'][0]['region'], 'regionid')

    def test_deleteTrack(self):
        d = self._createDocument()
        e = d.editing()
        oldCount = d._count()
        rootChapter = e.getChapters()
        subChapterId = rootChapter['chapters'][0]['id']
        trackId = e.addTrack(subChapterId, 'regionid')
        rootChapter = e.getChapters()
        self.assertEqual(len(chapter['chapters'][0]['tracks']), 1)
        e.deleteTrack(trackId)
        rootChapter = e.getChapters()
        self.assertEqual(len(chapter['chapters'][0]['tracks']), 0)

    def test_addElement(self):
        d = self._createDocument()
        e = d.editing()
        oldCount = d._count()
        rootChapter = e.getChapters()
        subChapterId = rootChapter['chapters'][0]['id']
        trackId = e.addTrack(subChapterId, 'regionid')
        elementId = e.addElement(trackId, 'assetid')
        e.setElementBegin(elementId, 42)
        e.setElementDuration(elementId, 43)
        thisChapter = e.getChapter(subChapterId)
        self.assertEqual(len(thisChapter['tracks']), 1)
        self.assertDictEqual(thisChapter['tracks'][0]['elements'][0], {'asset':assetid, 'begin':42, 'duration':43})
        self.assertDictEqual(thisChapter['tracks'][0]['region'], 'regionid')


if __name__ == '__main__':
    unittest.main()
