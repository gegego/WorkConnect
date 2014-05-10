#!/usr/bin/env python
"""
Web server using javascript applets.
Accepts websockets from each page and routes messages.
"""
import types, Queue, glob, time, itertools
import re, os, sys, traceback, random, gevent
sys.path.append("tools")
import gevent, geventwebsocket
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket.exceptions import WebSocketError

import gevent.monkey
gevent.monkey.patch_all()

from bottle import template, response
from bottle import request, Bottle, abort, static_file
from bottle import run, route, debug
import ujson as json

def monitor():
   import RunInst
   cnt=0
   mtime = os.path.getmtime("RunInst.py")
   task = gevent.spawn(RunInst.run, dict(cnt=cnt) )
   while 1:
       gevent.sleep(1)
       mtime1 = os.path.getmtime("RunInst.py")
       if mtime == mtime1:
           continue
       mtime = mtime1
       RunInst.stop()
       gevent.sleep(1)
       print "Kill"
       task.kill()
       try:
           reload(RunInst)
       except:
           traceback.print_exc()
           continue
       cnt+=1
       task = gevent.spawn(RunInst.run,  dict(cnt=cnt))

gevent.spawn(monitor)
while 1:
   gevent.sleep(100)
