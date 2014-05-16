import ctypes as c
import os, time, sys, Queue, atexit
import gevent, copy, types
from gevent import monkey, sleep
import ujson as json
import psycopg2
import time

#monkey.patch_all()

class DBWork:
    def __init__(self):
        self.jobData=[]
        self.initDB()
        
    def initDB(self):        
        self.conn_string="host='localhost' dbname='WorkConnect' user='postgres' password='64456683'"
        self.conn=psycopg2.connect(self.conn_string)
        self.cursor=self.conn.cursor()

    def insert2DB(self, m):
        query =  "INSERT INTO \"Works\" (\"JobName\", \"Description\", \"UserName\",\"Timing\") VALUES (%s, %s, %s, %s);"
        job=m["job"]
        desc=m["desc"]
        user=m["user"]
        timing=m["timing"]
        data = (job, desc, user, timing)
        self.cursor.execute(query, data)
        self.conn.commit()

    def deletefromDB(self, m):
        query =  "DELETE FROM \"Works\" WHERE \"ID\"=%s;"
        id=m["ID"]
        data = (id)
        self.cursor.execute(query, [data])
        self.conn.commit()
        
    def updateFromDB(self):
        self.cursor.execute("select * from \"Works\" ORDER BY \"ID\" DESC")
        self.jobData=self.cursor.fetchall()
        # for job in self.jobData:
            # job.append(job[4]-time.time())

def main():
    dbcon=DBWork()
    dbcon.updateFromDB()
    # m={}
    # m["ID"]=23
    # dbcon.deletefromDB(m)
    m={}
    m["job"]="adb"
    m["desc"]="aksldflsfs"
    m["user"]="wejaq"
    m["timing"]=time.time() + 1000
    dbcon.insert2DB(m)
    
def insert():
    m={}
    m["job"]="adb"
    m["desc"]="aksldflsfs"
    m["user"]="wejaq"
    m["timing"]=time.time() + 1000
    #dbcon.insert2DB(m)
    
if __name__ == "__main__":
    main()
 # dbdemo = DBWork()
 # dbdemo.updateFromDB()
