
/*

*/
if(window['workspaceLoaded'] == undefined){
    workconnectApp.directive('workspace', function($rootScope, udpMsgs, $http, $timeout){   
      return {
        scope: true,
        restrict: 'E',
        replace: true,
        templateUrl: "/partials/workspace.html",
        link: function(scope, iElement, iAttrs) {
            scope.AppletTitle="Working Spaces";
            scope.refresh = function(){
				console.log("1111");	
				var msg = copyObject(iAttrs);
				msg["evt"] = "updateWorkSpace";                
				msg["nexPertAppletID"] = msg["nexpertappletid"]		
				wsO.send(msg);					
			}
            scope.refresh();	
            scope.$on("worksUpdate", function(evt, msg){
                console.log("works", msg.worksdata);
                scope.works = msg.worksdata;
                scope.$digest();
            });
            
            scope.clearData = function(){
				scope.userName="";
                scope.jobName="";
                scope.descriptionContent="";
			}
            
			scope.submit = function(){
				console.log("1111");	
                console.log(scope.userName);
                console.log(scope.jobName);
                console.log(scope.descriptionContent);
				var msg = copyObject(iAttrs);
				msg["evt"] = "postWork";
                msg["user"] = scope.userName;
                msg["job"] = scope.jobName;
                msg["desc"] = scope.descriptionContent;
				msg["nexPertAppletID"] = msg["nexpertappletid"]		
				wsO.send(msg);			
                scope.refresh();
			}
        }
      };
    });
}
window['workspaceLoaded'] = true;

