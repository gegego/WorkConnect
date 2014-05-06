
/*

*/
if(window['workspaceLoaded'] == undefined){
    nexpertApp.directive('workspace', function($rootScope, udpMsgs, $http, $timeout){   
      return {
        scope: true,
        restrict: 'E',
        replace: true,
        templateUrl: "/partials/workspace.html",
        link: function(scope, iElement, iAttrs) {
            scope.AppletTitle="Working Spaces";
			// var msg = copyObject(iAttrs);
            // msg["evt"] = "EVT_SCSE_10002";
            // msg["nexPertAppletID"] = msg["nexpertappletid"]		
			// wsO.send(msg);	
			scope.submit = function(){
				console.log("1111");	
				var msg = copyObject(iAttrs);
				msg["evt"] = "EVT_SCSE_10002";
				msg["nexPertAppletID"] = msg["nexpertappletid"]		
				wsO.send(msg);					
			}
        }

      };
    });
}
window['workspaceLoaded'] = true;

