import ctypes as c
import os, time, sys, Queue, atexit
import gevent, copy, types
from gevent import monkey, sleep
import ujson as json
import psycopg2
import DBPostgreSql
from DBPostgreSql import DBWork
import time
#monkey.patch_all()

class Job:
    def __init__(self):
        self.Jobs=[]
        self.TimingKill=[]
        self.DB=DBWork()
    
    def updateJobs(self):
        self.DB.updateFromDB()
        self.Jobs=self.DB.jobData
    
    def calculateTimingKill(self):
        self.TimingKill=[]
        for job in self.Jobs:
            m={}
            if(job[4]-((int)(time.time())) > 0):
                m[job[3]]=job[4]-((int)(time.time()))
                self.TimingKill.append(m)
            else:
                mm={}
                mm["ID"]=job[3]
                self.DB.deletefromDB(mm)           
    
    def insertJob(self,m):
        self.DB.insert2DB(m)
        
    def deleteJob(self,m):
        self.DB.deletefromDB(m)
 
def main():
    jb=Job()
    jb.updateJobs()
    jb.calculateTimingKill()
    print jb.TimingKill
    
if __name__ == "__main__":
    main()