'use strict';

var wsReadyEvt=[];
var wsIsConnected=0;

function addWsReady(f){
    if(wsIsConnected){
        f();
    }
    wsReadyEvt.push(f)
}

function triggerWsReady(){
    wsIsConnected=1;
    for(var xx=0;xx<wsReadyEvt.length; xx++){
        wsReadyEvt[xx]();
    }
}

var socStats;
var socStatsReopen;
var myGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});

function getMs(){
    var curTimeObj = new Date();
    var res = (curTimeObj.getMinutes() * 60*1000) + (curTimeObj.getSeconds() * 1000) + curTimeObj.getMilliseconds();
    return res;
}


var getWebSocket = function(url , portOverride, openCb){
    var soc=undefined;
    var onMsgEvts={};
    var backlog=[];
    var lastPingMsgTime=getMs();
    var self = {
        open: function(){
            connectSoc();
            setTimeout(connectSocCheck, 3000);
        },
        reg: function(evt, cb){
            if(onMsgEvts[evt] == undefined){
                onMsgEvts[evt]=[];
            }
            onMsgEvts[evt].push(cb);
        },
        send: function (m) {
            if(soc.readyState == 0){
                backlog.push(m);
            }else{
                soc.send(JSON.stringify(m));
            }
        }
    };

    var connectSocCheck = function()
    {
      //console.log("Check", soc);
      if(soc == undefined || soc.readyState == 3){
          connectSoc();
      }else{
          //console.log("OKAY");
          var now = getMs();
          //console.log("P:", now - lastPingMsgTime);
          // if(now - lastPingMsgTime > 2000){
          //     soc.close();
          //     console.log("Ping timeout");
          //     lastPingMsgTime = now;
          // }
      }
      setTimeout(connectSocCheck, 3000);
    }
    var connectSoc =  function()
    {
        wsIsConnected=0;
        if(rootWs == undefined){
            var root, rootWs;
            if(portOverride != undefined){
                root = location.protocol + '//' + location.host;
                root = root.replace(/:\d+/, ":"+portOverride);
            }else{
                root = location.protocol + '//' + location.host;
            }

            //console.log(root);
            rootWs = root.replace("http", "ws");
        }
        var urlTmp = rootWs+url;
        console.log("open: ", urlTmp);
        try {
            soc = new WebSocket(urlTmp);
        }
        catch (e) {
            soc = new MozWebSocket(urlTmp);
        }  
        function onopen() {
            // Not called ---------------------
            soc.send(JSON.stringify({evt:"guid", value:myGuid}));
            for(var xx=0; xx<backlog.length; xx++){
                soc.send(JSON.stringify(backlog[xx]));
            }
            backlog = [];
            triggerWsReady();
            //console.log("Open");
            if(openCb != undefined){
                openCb();
            }
        };
        soc.onopen = onopen;
        soc.onmessage = onmessage;
    }
    var onmessage =  function(e){
        //console.log(e.data);
        if(e.data == "{}" || e.data==undefined){
          return;
        }
        //console.log("INPUT:", soc, e.data);
        try{
            var msg = JSON.parse(e.data);
        }catch(e){
            console.log(soc, e);
            throw(err);
        }
        console.log(msg);
        if(msg.evt=="ping"){
            lastPingMsgTime=getMs();
        }else{
            //console.log(msg.evt);
            var cbs = onMsgEvts[msg.evt];
            if(cbs != undefined){
              for(var xx=0; xx < cbs.length; xx++){
                cbs[xx](msg);
              }
            }
        }
        soc.send("{}");
    }

    self.open();
    return self;
};
