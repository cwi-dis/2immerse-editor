from __future__ import print_function
from __future__ import unicode_literals
import unittest
import subprocess
import sys
import time
import os
import requests
import xml.etree.ElementTree as ET

COVERAGE=False
KEEP_SERVER=False

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

class TestAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        homedir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        server = os.path.join(homedir, 'run.py')
        os.environ['KIBANA_SERVICE_URL'] = ""
        os.putenv('KIBANA_SERVICE_URL', "")
        cmd = [sys.executable]
        if COVERAGE:
            # untested
            cmd += ['-m', 'coverage', 'run', '--parallel-mode']
        cmd += [server]
        cls.serverProcess = subprocess.Popen(cmd, cwd=homedir)
        cls.serverUrl = 'http://localhost:8000'
        cls.serverApi = cls.serverUrl + '/api/v1'
        time.sleep(2)
        
    @classmethod
    def tearDownClass(cls):
        if KEEP_SERVER:
            print('Press control-c to terminate server -')
            try:
                time.sleep(99999)
            except KeyboardInterrupt:
                pass
        cls.serverProcess.terminate()
        cls.serverProcess.wait()
        
    def test_index(self):
        r = requests.get(self.serverUrl)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.text[0], '<')
        
    def test_api(self):
        r = requests.get(self.serverApi + '/document')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(type(r.json()), type([]))

    def test_configuration(self):
        r = requests.put(self.serverApi + '/configuration', json={'mode' : 'tv'})
        r = requests.get(self.serverApi + '/configuration')
        rv = r.json()
        self.assertIn('mode', rv)
        self.assertEqual('tv', rv['mode'])
        r = requests.put(self.serverApi + '/configuration', json={'mode' : 'standalone'})
        r = requests.get(self.serverApi + '/configuration')
        rv = r.json()
        self.assertIn('mode', rv)
        self.assertEqual('standalone', rv['mode'])
        
    def test_createDocument(self):
        r = requests.post(self.serverApi + '/document', data=DOCUMENT)
        self.assertEqual(r.status_code, 200)
        rv = r.json()
        self.assertEqual(type(rv), type({}))
        self.assertIn('documentId', rv)
        
        documentId = rv['documentId']
        
        r = requests.get(self.serverApi + '/document/' + documentId)
        
        root = ET.fromstring(r.text)
        self.assertEqual(root.tag, 'testDocument')
        self.assertEqual(len(root), 3)
        
if __name__ == '__main__':
    unittest.main()
    
