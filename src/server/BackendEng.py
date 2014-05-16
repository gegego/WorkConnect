import ctypes as c
import os, time, sys, Queue, atexit
import gevent, copy, types
from gevent import monkey, sleep
import ujson as json
import psycopg2
import Job
from Job import Job
import time
from threading import Timer

monkey.patch_all()

eng = None
readTaskTh=None
useDll=False

def MoniterJob():
    while True:
        #print eng.jb.Jobs
        m={}
        eng.jb.calculateTimingKill()
        eng.updateWorkSpace(m)
        #print eng.jb.TimingKill
        #print "From print_time", time.time()
        time.sleep(5)

Timer(5, MoniterJob, ()).start()

def getUseDll():
    return useDll

def startEng(useDllFlag=False):
    global eng, readTaskTh, useDll

    useDll = useDllFlag

    if readTaskTh:
        readTaskTh.kill()

    if useDll:
        # assume the testDll is in this directory
        os.environ['PATH'] = os.path.abspath(".") + ';' + os.environ['PATH']

        eng = c.cdll.LoadLibrary('P1EngineConnect.dll')
        eng.Start()

        eng.sendMsgFromPy.restype = c.c_char_p

        #============================
        eng.getMsgFromPySz.restype = c.c_uint;
        eng.getMsgFromPySz.argtypes = None

        eng.sendMsgFromPy.restype = None
        eng.sendMsgFromPy.argtypes = [c.c_char_p]
        #============================
        eng.getMsgFromPy.restype = c.c_char_p
        eng.getMsgFromPy.argtypes = [c.c_ulong]

        #============================
        eng.getMsgToPySz.restype = c.c_uint;
        eng.getMsgToPySz.argtypes = None

        eng.sendMsgToPy.restype = None
        eng.sendMsgToPy.argtypes = [c.c_char_p]
        #============================
        eng.getMsgToPy.restype = c.c_char_p
        eng.getMsgToPy.argtypes = [c.c_ulong]
        #============================
        #--------------------------

    else:
        class Eng:
            def __init__(self):
                self.msgsIn=[]
                self.msgsOut=[]
                self.jb=Job()
                self.serviceSessionStarted=False

                self.handlers=dict(
                    startServiceSession= self.startServiceSession,
                    stopServiceSession=  self.stopServiceSession,
                    getSheetCount=  self.getSheetCount,
                    updateWorkSpace= self.updateWorkSpace,
                    postWork= self.postWork,
                )

            def startServiceSession(self, m):
                def x():
                    for x in range(11):
                        m["evt"]="servicesessionProg"
                        m["val"]=x*10
                        m["status"]="starting: %d%%"%(x*10)
                        self.msgsOut.append(json.dumps(m))
                        gevent.sleep(0.2)
                    m["evt"]="serviceSessionStarted"
                    m["status"]="Started";
                    self.msgsOut.append(json.dumps(m))
                gevent.spawn(x)
                #print "startServiceSession"
                
            def updateWorkSpace(self, m):
                def x():
                    gevent.sleep(1)
                    self.jb.updateJobs()
                    self.jb.calculateTimingKill()
                    m["evt"]="worksUpdate"
                    m["worksdata"]=self.jb.Jobs;
                    m["timingKill"]=self.jb.TimingKill;
                    self.msgsOut.append(json.dumps(m))
                gevent.spawn(x)
            
            def postWork(self, m):
                def x():
                    gevent.sleep(1)
                    m["timing"]=time.time() + 1000
                    print m
                    self.jb.insertJob(m)
                    # print "Post work"
                    # print m
                    # query =  "INSERT INTO \"Works\" (\"JobName\", \"Description\", \"UserName\") VALUES (%s, %s, %s);"
                    # job=m["job"]
                    # desc=m["desc"]
                    # user=m["user"]
                    # data = (job, desc, user)
                    # self.cursor.execute(query, data)
                    # self.conn.commit()
                    # table=self.cursor.fetchall()
                    # m["evt"]="worksUpdate"
                    # m["worksdata"]=table;
                    # self.msgsOut.append(json.dumps(m))
                gevent.spawn(x)            
				
            def stopServiceSession(self, m):
                def x():
                    gevent.sleep(1)
                    m["evt"]="serviceSessionStopped"
                    m["status"]="Stopped";
                    self.msgsOut.append(json.dumps(m))
                gevent.spawn(x)
                #print "stopServiceSession"

            def getSheetCount(self, m):
                def x():
                    gevent.sleep(1)
                    sheetCntr = SheetCntrTest()
                    sheetCntr.inc()
                    m["evt"]="EVT_SCSE_10001"
                    m["value"]=sheetCntr.tabs;
                    self.msgsOut.append(json.dumps(m))
                gevent.spawn(x)
                #print "getSheetCount"
				
            def start(self):
                pass

            def stop(self):
                pass

            def getMsgToPySz(self):
                #print "Len:", len(self.msgsOut)
                return len(self.msgsOut)

            def getMsgToPy(self, timeout):
                val = self.msgsOut[0]
                del self.msgsOut[0]
                print "Send: ", val
                return val

            def sendMsgFromPy(self, val):
                try:
                    val = json.loads(val)
                except:
                    print "Failed to json.loads:", repr(val)

                cb = self.handlers.get(val.get("evt"))
                if cb == None:
                    print "Uknown evt:", val
                    return
                print "In: ", val
                cb(val)

        eng = Eng()

    eng.sendMsgFromPy("{}")

    def exitFun():
        eng.Stop()

    atexit.register(exitFun)
    readTaskTh = gevent.spawn(readTask)



inboundMsgs = Queue.Queue()
webSocketRouts={}
def readTask():
    """Avoid blocking gevent.
    So poll for messages from the engine.
    load inboundMsgs with new messages.
    """
    while 1:
        while eng.getMsgToPySz() == 0:
            gevent.sleep(0.01)

        mOrig = eng.getMsgToPy(7777)
        if mOrig == None:
            continue
        if len(mOrig) == 0:
            print "Null msg from engine"
            gevent.sleep(1)
            continue
        try:
            m = json.loads(mOrig)
        except:
            print "Json error:"
            print repr(mOrig)
        inboundMsgs.put(m)



def sendMsgToEng(msg):
    print "sendMsgToEng:", msg
    if not isinstance(msg, types.StringType):
        msg = json.dumps(msg)
    try:
        # s = c.cast(msg, c.c_char_p)
        eng.sendMsgFromPy(msg)
    except:
        print repr(msg)
        raise


class SheetCntrTest(object):
    def __init__(self):		
        self.tabs={
"Total Surfaces Detected":155422,
"Equivalent A4":1,
"Simplex Less Equal A4":12,
"Simplex Greater Than A4":1,
"Simplex 3x A4":1,
"Simplex 4x A4":13232,
"Duplex Less Equal A4":1,
"Duplex Greater Than A4":1222,
"Duplex 3x A4":1,
"Duplex 4x A4":1,

"5 Color Mode Equivalent A4":1,
"5 Color Mode Simplex Surface Less Equal A4":1,
"5 Color Mode Simplex Surface Greater Than A4":1,
"5 Color Mode Simplex Surface 3x A4":1,
"5 Color Mode Simplex Surface 4x A4":1,
"5 Color Mode Duplex Surface Less Equal A4":1,
"5 Color Mode Duplex Surface Greater Than A4":1,
"5 Color Mode Duplex Surface 3x A4":1,
"5 Color Mode Duplex Surface 4x A4":1,

"Black Mode Equivalent A4":1,
"Black Mode Simplex Surface Less Equal A4":1,
"Black Mode Simplex Surface Greater Than A4":1,
"Black Mode Simplex Surface 3x A4":1,
"Black Mode Simplex Surface 4x A4":1,
"Black Mode Duplex Surface Less Equal A4":1,
"Black Mode Duplex Surface Greater Than A4":1,
"Black Mode Duplex Surface 3x A4":1,
"Black Mode Duplex Surface 4x A4":1,

"Economy Mode Equivalent A4":1,
"Economy Mode Simplex Surface Less Equal A4":1,
"Economy Mode Simplex Surface Greater Than A4":1,
"Economy Mode Simplex Surface 3x A4":1,
"Economy Mode Simplex Surface 4x A4":1,
"Economy Mode Duplex Surface Less Equal A4":1,
"Economy Mode Duplex Surface Greater Than A4":1,
"Economy Mode Duplex Surface 3x A4":1,
"Economy Mode Duplex Surface 4x A4":1,

"Black Surfaces Detected":1,
"Black Equivalent A4 Detected":1,
"Black Simplex Surface Less Equal A4 Detected":1,
"Black Simplex Surface Greater Than A4 Detected":1,
"Black Simplex Surface 3x A4 Detected":1,
"Black Simplex Surface 4x A4 Detected":1,
"Black Duplex Surface Less Equal A4 Detected":1,
"Black Duplex Surface Greater Than A4 Detected":1,
"Black Duplex Surface 3x A4 Detected":1,
"Black Duplex Surface 4x A4 Detected":1,

"Blank Surfaces Detected":1,
"Blank Equivalent A4 Detected":1,
"Blank Simplex Surface Less Equal A4 Detected":1,
"Blank Simplex Surface Greater Than A4 Detected":1,
"Blank Simplex Surface 3x A4 Detected":1,
"Blank Simplex Surface 4x A4 Detected":1,
"Blank Duplex Surface Less Equal A4 Detected":1,
"Blank Duplex Surface Greater Than A4 Detected":1,
"Blank Duplex Surface 3x A4 Detected":1,
"Blank Duplex Surface 4x A4 Detected":1,

"Service Mode Equivalent A4":1,
"Service Mode Simplex Less Equal A4":1,
"Service Mode Simplex Greater Than A4":1,
"Service Mode Simplex 3x A4":1,
"Service Mode Simplex 4x A4":1,
"Service Mode Duplex Less Equal A4":1,
"Service Mode Duplex Greater Than A4":1,
"Service Mode Duplex 3x A4":1,
"Service Mode Duplex 4x A4":1

			# dict(name="Totaltab",
                # values=[
                    # dict(name="Total Surfaces Detected", value=11),
                    # dict(name="Equivalent A4", value=0),
                    # dict(name="Simplex Less Equal A4", value=0),
                    # dict(name="Simplex Greater Than A4", value=0),
                    # dict(name="Simplex 3x A4", value=0),
                    # dict(name="Simplex 4x A4", value=0),
                    # dict(name="Duplex Less Equal A4", value=0),
                    # dict(name="Duplex Greater Than A4", value=0),                          
                    # dict(name="Duplex 3x A4", value=0),                            
                    # dict(name="Duplex 4x A4", value=0)
            # ]),
            # dict(name="Totaltab",
                # values=[
                    # dict(name="Total Surfaces Detected", value=11),
                    # dict(name="Equivalent A4", value=0),
                    # dict(name="Simplex Less Equal A4", value=0),
                    # dict(name="Simplex Greater Than A4", value=0),
                    # dict(name="Simplex 3x A4", value=0),
                    # dict(name="Simplex 4x A4", value=0),
                    # dict(name="Duplex Less Equal A4", value=0),
                    # dict(name="Duplex Greater Than A4", value=0),                          
                    # dict(name="Duplex 3x A4", value=0),                            
                    # dict(name="Duplex 4x A4", value=0)
            # ]),
            # dict(name="FiveColortab",
            # values=[
                # dict(name="5 Color Mode Equivalent A4", value=0),
                # dict(name="5 Color Mode Simplex Surface Less Equal A4", value=0),
                # dict(name="5 Color Mode Simplex Surface Greater Than A4", value=0),                        
                # dict(name="5 Color Mode Simplex Surface 3x A4", value=0),
                # dict(name="5 Color Mode Simplex Surface 4x A4", value=0),
                # dict(name="5 Color Mode Duplex Surface Less Equal A4", value=0),
                # dict(name="5 Color Mode Duplex Surface Greater Than A4", value=0),
                # dict(name="5 Color Mode Duplex Surface 3x A4", value=0),                       
                # dict(name="5 Color Mode Duplex Surface 4x A4", value=0)
            # ]),
            # dict(name="BlackModetab",
            # values=[
                # dict(name="Black Mode Equivalent A4", value=0),
                # dict(name="Black Mode Simplex Surface Less Equal A4", value=0),
                # dict(name="Black Mode Simplex Surface Greater Than A4", value=0),                      
                # dict(name="Black Mode Simplex Surface 3x A4", value=0),
                # dict(name="Black Mode Simplex Surface 4x A4", value=0),
                # dict(name="Black Mode Duplex Surface Less Equal A4", value=0),
                # dict(name="Black Mode Duplex Surface Greater Than A4", value=0),
                # dict(name="Black Mode Duplex Surface 3x A4", value=0),                     
                # dict(name="Black Mode Duplex Surface 4x A4", value=0)
            # ]),
            # dict(name="EconomyModetab",
            # values=[
                # dict(name="Economy Mode Equivalent A4", value=0),
                # dict(name="Economy Mode Simplex Surface Less Equal A4", value=0),
                # dict(name="Economy Mode Simplex Surface Greater Than A4", value=0),                        
                # dict(name="Economy Mode Simplex Surface 3x A4", value=0),
                # dict(name="Economy Mode Simplex Surface 4x A4", value=0),
                # dict(name="Economy Mode Duplex Surface Less Equal A4", value=0),
                # dict(name="Economy Mode Duplex Surface Greater Than A4", value=0),
                # dict(name="Economy Mode Duplex Surface 3x A4", value=0),                       
                # dict(name="Economy Mode Duplex Surface 4x A4", value=0)
            # ]),
            # dict(name="BlackDetectedtab",
            # values=[
                # dict(name="Black Surfaces Detected", value=0),
                # dict(name="Black Equivalent A4 Detected", value=0),
                # dict(name="Black Simplex Surface Less Equal A4 Detected", value=0),                        
                # dict(name="Black Simplex Surface Greater Than A4 Detected", value=0),
                # dict(name="Black Simplex Surface 3x A4 Detected", value=0),
                # dict(name="Black Simplex Surface 4x A4 Detected", value=0),
                # dict(name="Black Duplex Surface Less Equal A4 Detected", value=0),
                # dict(name="Black Duplex Surface Greater Than A4 Detected", value=0),                       
                # dict(name="Black Duplex Surface 3x A4 Detected", value=0),                     
                # dict(name="Black Duplex Surface 4x A4 Detected", value=0)
            # ]),
            # dict(name="BlankDetectedtab",
            # values=[
                # dict(name="Blank Surfaces Detected", value=0),
                # dict(name="Blank Equivalent A4 Detected", value=0),
                # dict(name="Blank Simplex Surface Less Equal A4 Detected", value=0),                        
                # dict(name="Blank Simplex Surface Greater Than A4 Detected", value=0),
                # dict(name="Blank Simplex Surface 3x A4 Detected", value=0),
                # dict(name="Blank Simplex Surface 4x A4 Detected", value=0),
                # dict(name="Blank Duplex Surface Less Equal A4 Detected", value=0),
                # dict(name="Blank Duplex Surface Greater Than A4 Detected", value=0),                       
                # dict(name="Blank Duplex Surface 3x A4 Detected", value=0),                     
                # dict(name="Blank Duplex Surface 4x A4 Detected", value=0),
            # ]),
            # dict(name="ServiceModetab",
            # values=[
                # dict(name="Service Mode Equivalent A4", value=0),
                # dict(name="Service Mode Simplex Less Equal A4", value=0),                      
                # dict(name="Service Mode Simplex Greater Than A4", value=0),
                # dict(name="Service Mode Simplex 3x A4", value=0),
                # dict(name="Service Mode Simplex 4x A4", value=0),
                # dict(name="Service Mode Duplex Less Equal A4", value=0),
                # dict(name="Service Mode Duplex Greater Than A4", value=0),                     
                # dict(name="Service Mode Duplex 3x A4", value=0),                       
                # dict(name="Service Mode Duplex 4x A4", value=0),
            # ])
        }        

    # def inc1(self, amt=1):
        # for tab in self.tabs:
            # for v in tab["values"]:
                # v["value"]+= amt
	
    def inc(self):
        conn_string="host='localhost' dbname='test' user='postgres' password='64456683'"
        conn=psycopg2.connect(conn_string)
        cursor=conn.cursor()
        cursor.execute("select * from sheetcount")
        table=cursor.fetchall()
        for row in table:
            self.tabs[row[0]]=row[1];

