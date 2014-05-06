#!/usr/bin/env python
"""
Web server for javascript applets.
Accepts websockets from each page and routes messages.

At startup:
tagMap = convertAspToAngular.main()
Parses all .asp files creating angular tags in a dictionary.
Keyed on the myId of each applet.

As pages are served the applet is replaced with the angular tags.
"""
import ujson as json
import types, Queue, glob, time, itertools, atexit
import re, os, sys, traceback, random, gevent, copy
sys.path.insert(0, "tools")
import gevent, geventwebsocket, weakref, collections
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket.exceptions import WebSocketError

import gevent.monkey
gevent.monkey.patch_all()

from BackendEng import inboundMsgs, sendMsgToEng, SheetCntrTest, startEng
from BackendEng import getUseDll
# from filterNexpert import fixAspPage, scanFiles, getTranalations, addJsFiles
# from filterNexpert import getJsIncludes

try:
    startEng()
except:
    print "Failed to start BackendEng"
    raise


htmlBase = "D:/work/MyProject/WorkSpace/src/html/"
# scanFiles(nexPertBase=nexPertBase)

# nexPertTransBase = "C:/CDFE_ROOT/NexPertFF1/nexPertWs/resources"
# getTranalations(nexPertTransBase)


webSocketRouts={}

from bottle import template, response
from bottle import request, Bottle, abort, static_file
from bottle import run, route, debug


lastFileLoadTime=time.time()
def showLastLoadTime(fn):
    global lastFileLoadTime
    #print "LastLoad:", time.time() - lastFileLoadTime, fn
    lastFileLoadTime = time.time()


def setupRoutes(app):
    global lastFileLoadTime
    print "Reloading"
    @app.route('/')
    def fff():
        print "ROOT", htmlBase
        fn = "/demo.html"
        response = static_file(fn, root=htmlBase)
        return response

    #================
    @app.route('/<path:re:.*>')
    def fff(path):
        print path
        showLastLoadTime(path)
        startTime = time.time()
        fn = htmlBase+"/"+path
        print fn
        response = static_file("/"+path, root=htmlBase)
        print response
        # res = addJsFiles(path, response)
        if (time.time() - startTime) > 0.1:
            print "FILE:", fn, os.path.exists(fn)
            print "Time:", time.time() - startTime
        return response

    #================
    @app.route('/test')
    def fff():
        response = static_file("test.html", root='.')
        # res = addJsFiles("test.html", response)
        return response

    #================
    @app.route('/nexPertTrans.js')
    def fff():
        return static_file("nexPertTrans.js", root='.')

    #================
    @app.route('/<filename>')
    def fff(filename):
        return static_file(filename, root='app')

    #================
    @app.route('/js/<filename>')
    def fff(filename):
        showLastLoadTime(filename)
        return static_file(filename, root='app/js')

    #================
    @app.route('/directives/<filename>')
    def fff(filename):
        showLastLoadTime(filename)
        return static_file(filename, root='app/directives')

    #================
    @app.route('/partials/<filename>')
    def fff(filename):
        return static_file(filename, root='app/partials')

    #================
    @app.route('/css/<path:path>')
    def fff(path):
        return static_file(path, root='app/css')

    #================
    @app.route('/img/<path:path>')
    def fff(path):
        return static_file(path, root='app/img')
    #================
    @app.route('/lib/<path:path>')
    def fff(path):
        return static_file(path, root='app/lib')          

    #================
    @app.route('/ws/stats')
    def handle_websocket():
        """ 
        """
        global appCnt
        appCnt+=100
        appCntL = appCnt
        wsock = request.environ.get('wsgi.websocket')
        if not wsock:
            abort(400, 'Expected WebSocket request.')
        Ws(wsock)


    def removeUnicode(data):
        newData={}
        for k,v in data.items():
            try:
                v = v.encode('utf-8','ignore')
            except:
                pass
            newData[k.encode('utf-8','ignore')] = v
        return newData

    #================
    @app.post('/configItParms')
    def xxx():
        global htmlBase
        data = removeUnicode(request.json)

        msg = ""
        try:
            startEng(data['useDll'])
        except:
            msg = traceback.format_exc()
            print msg

        if data["curLang"] != htmlBase:
            assert os.path.exists(data["curLang"])
            htmlBase = data["curLang"]
            try:
                scanFiles(htmlBase=htmlBase)
            except:
                msg = traceback.format_exc()
                print msg

        broadcastMsg(dict(evt="configSet"))
        return msg


    @app.get('/configItParms')
    def xxx():
        global htmlBase
        htmlBase = htmlBase.replace(os.sep, "/")
        root = htmlBase.rsplit("/", 2)[0]
        langs = [{"name":v.replace(os.sep,"/")+"/"} for v in glob.glob(root+"/*")]
        curLang=htmlBase

        data = json.dumps(dict(
                useDll=getUseDll(),
                langs=langs,
                curLang=curLang
                )
        )
        return data

    #================
    @app.route('/configIt')
    def xxx():
        print "Config:"
        html = """
            <HTML ng-app='nexpert-app'>
            <head>
            %s
            <script src="/js/config.js" type="text/javascript" ></script>
            <head>
            <body>
                <config></config>
            </body>
            </HTML>
        """%getJsIncludes()
        return html


class Ws(object):
    """ Maintain context for a websocket
    A single websocket is opened for each page load in Nexpert.
    Each page can have multiple applet scripts. All speaking on the same 
    websocket.

    This object receives JSON messages and routes them according to the
    "evt" element.  
    """
    def __init__(self, ws):
        self.ws=ws
        self.run=1
        # guid of the page. Dynamically generated each load.
        self.guid=None 
        self.callBacks=dict(guid=[self.setGuid])
        # Show another way to register
        self.regCb("applet", self.newApplet) 
        wsJobsAdd(self)
        self.task()

    def close(self):
        self.ws.close()

    def regCb(self, evt, cb):
        """ 
        """
        self.callBacks.setdefault(evt,[]).append(cb)

    def newApplet(self, guid, wkref, msg, rawMsg):
        """ 
        """
        print "New applet:", msg

    def setGuid(self,msg):
        """ 
        """
        print "set guid"


    def send(self, msg):
        """ 
        assume msg is json
        """
        try:
            msg = msg.encode('utf-8','ignore')
            #print "send", repr(msg)
            self.ws.send(msg, False) 
        except:
            raise
            #print "Send fail"
            self.run=0

    def task(self):
        """ Read messages from the websocket and route them.
        """
        try:
            #print "Task start"
            while self.run:
                try:
                    rawMsg = self.ws.receive()
                    if rawMsg == "{}":
                        continue
                    try:
                        msg = json.loads(rawMsg)
                    except:
                        print "Error loading json: websocket exiting"
                        print repr(rawMsg)
                        return

                    try:
                        cbList = self.callBacks.get(msg["evt"], [sendMsgToEng])
                    except:
                        print "RawMsg:", repr(rawMsg)
                        print "MSG:", repr(msg)
                        raise

                    if len(cbList) == 0:
                        print "No registered handler for evt:", msg

                    # if self.guid:
                    #     msg["guid"] = self.guid
                    #     rawMsg = json.dumps(msg)

                    #print "MsgIn:", rawMsg
                    for cb in cbList:
                        try:
                            cb(msg)
                        except:
                            print "Cb failed: ", cb
                            raise

                except WebSocketError:
                    break
        except:
            traceback.print_exc()
        finally:
            self.run=0
            #print "Task done"
            pass




appCnt=0
wsJobs=[] # Keep track of webSockets
history= collections.deque(maxlen=100)
def wsJobsAdd(job):
    """ 
    """
    global wsJobs
    wsJobs = [j for j in wsJobs if j.run]
    wsJobs.append(job)
    for msg in history:
        job.send(msg)

def closeAllWs():
    [j.close() for j in wsJobs]


def broadcastMsg(msg):
    msg = json.dumps(msg)
    for j in wsJobs:
        try:
            j.send(msg)
        except WebSocketError:
            pass



def wsTaskSender():
    """ Example of a task sending to all applets. 
    """
    #return
    loop=0
    sheetCntr = SheetCntrTest()
    while 1:
        msg = inboundMsgs.get()
        msg = json.dumps(msg)
        history.append(msg)
        #gevent.sleep(1)
        #sheetCntr.inc()
        pos=0		
        for j in wsJobs:
            try:
                
                #j.send(json.dumps(dict(evt="sheetCountersEvt", value=sheetCntr.tabs) ) )
                j.send(msg)
            except WebSocketError:
                pass
            pos += 1
        loop += 100

taskSenderT = gevent.spawn(wsTaskSender)
wsServer = None
def run(parms):
    """ NOTE---- 
    reload isn't reloading the routes???
    """
    global wsServer
    app = Bottle()   
    app.debug = True
    #debug(True)
    setupRoutes(app)
    print "Starting wsServer on port: 8083"
    try:
        wsServer = WSGIServer(("0.0.0.0", 8083), app, handler_class=WebSocketHandler)
        wsServer.serve_forever(stop_timeout=1)                
    finally:
        app.close()
        print "Server exit"


