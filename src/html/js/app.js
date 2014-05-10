'use strict';

// Declare app level module which depends on filters, and services
var workconnectApp = angular.module('workconnect-app', ['ui.bootstrap']);

function copyObject(obj) {
    var newObj = {};
    for (var key in obj) {
        if(key[0] != '$'){
            newObj[key] = obj[key];
        }
    }

    return newObj;
}

// Expand HTML entities
String.prototype.unescapeHtml = function () {
    var temp = document.createElement("div");
    temp.innerHTML = this;
    var result = temp.childNodes[0].nodeValue;
    temp.removeChild(temp.firstChild);
    return result;
}

workconnectApp.filter('trl', function($rootScope, $sce) {
      return function(input) {
        console.log($rootScope.Locale);
        console.log(input);
        $rootScope.Locale = $rootScope.Locale.toLowerCase();
        if($rootScope.Locale == "zh"){
           $rootScope.Locale = "cn";
        }
        var key = translationsDict["rev"][input];
        // console.log("key: " + key);
        var res = translationsDict[$rootScope.Locale][key];
        if(res == undefined){
            return input;
        }
        return res.unescapeHtml();
      };
});

workconnectApp.factory('udpMsgs', function ($rootScope, $timeout, $http) {
    wsO.regAll(function(msg){
        //console.log(msg);
        $rootScope.$broadcast(msg.evt, msg);
    });

    wsO.regOnOpen(function(){
        $rootScope.$broadcast("wsOpen", {});
    });

    return {
        reg: function(cb){
            wsO.reg(cb);
        },
        send: function (m) {
            wsO.send(m);
        }
    };
});



// function trl(key){
//     console.log("K:", key);
//     return key;
// }