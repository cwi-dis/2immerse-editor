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
import unittest
import time

from . import pretest
from app.api import clocks


class TestClocks(unittest.TestCase):
    DELTA_T = 0.01

    def test_systemClock(self):
        """Test that SystemClock runs at the right speed"""
        clock = clocks.SystemClock()
        start = clock.now()
        self.assertAlmostEqual(start, time.time(), delta=self.DELTA_T)
        
        now = clock.now()
        self.assertAlmostEqual(now, start, delta=self.DELTA_T)
        
        clock.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+1, delta=self.DELTA_T)
        
        time.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+2, delta=self.DELTA_T)
        
    def test_fastClock(self):
        """Test that FastClock runs at the right speed"""
        clock = clocks.FastClock()
        start = clock.now()
        self.assertAlmostEqual(start, 0, delta=self.DELTA_T)
        now = clock.now()
        self.assertAlmostEqual(now, start, delta=self.DELTA_T)
        
        clock.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+1, delta=self.DELTA_T)
        
        time.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+1, delta=self.DELTA_T)
        
    def test_pauseableClock(self):
        """Test a PausableCLock with underlying FastClock"""
        underlyingClock = clocks.FastClock()
        clock = clocks.PausableClock(underlyingClock)
        
        self.assertEqual(clock.getRate(), 0.0)
        clock.start()
        self.assertEqual(clock.getRate(), 1.0)
        clock.stop()
        self.assertEqual(clock.getRate(), 0.0)
        clock.start()
        
        start = clock.now()
        self.assertAlmostEqual(start, 0, delta=self.DELTA_T)
        now = clock.now()
        self.assertAlmostEqual(now, start, delta=self.DELTA_T)
        
        underlyingClock.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+1, delta=self.DELTA_T)
        
        clock.stop()
        underlyingClock.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+1, delta=self.DELTA_T)
        
        clock.start()
        underlyingClock.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+2, delta=self.DELTA_T)
        
        time.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+2, delta=self.DELTA_T)
        
        clock.set(start+10)
        underlyingClock.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+11, delta=self.DELTA_T)
        
        clock.stop()
        clock.set(start+20)
        underlyingClock.sleep(1)
        now = clock.now()
        self.assertAlmostEqual(now, start+20, delta=self.DELTA_T)
        
    def callbackHelper(self, arg):
        self.callbackArg = arg
        
    def schedule(self, callback, *args, **kwargs):
        callback(*args, **kwargs)
        
    def test_callbackPausableClock(self):
        self.callbackArg = None
        underlyingClock = clocks.FastClock()
        clock = clocks.CallbackPausableClock(underlyingClock)
        clock.start()
        start = clock.now()
        self.assertAlmostEqual(start, 0, delta=self.DELTA_T)
        
        self.assertEqual(clock.nextEventTime(), clocks.never)
        
        clock.schedule(10, self.callbackHelper, 'callback1')
        clock.sleepUntilNextEvent()
        self.assertAlmostEqual(clock.now(), start+10, delta=self.DELTA_T)
        
        clock.handleEvents(self)
        self.assertEqual(self.callbackArg, 'callback1')
        
        
if __name__ == '__main__':
    unittest.main()
    
