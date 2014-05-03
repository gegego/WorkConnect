/*
*/
if(window['configLoaded'] == undefined){
    nexpertApp.directive('config', function($rootScope, udpMsgs, $http, $timeout){
      return {
        scope: true,
        restrict: 'E',
        replace: true,
        templateUrl: "/partials/config.html",
        link: function(scope, iElement, iAttrs) {         

            scope.parms={
                useDll:false,
            };

            scope.getParms = function(){
                $http({
                    method: 'GET',
                    url: "/configItParms"
                }).success(function(data, status, headers, config) {
                    console.log("ddd", data);
                    scope.parms = data;
                });
            }

            scope.$on("wsOpen", function(){
                console.log("wsOpen");
                scope.getParms();
            });

            scope.$on("configSet", function(){
                console.log("configSet");
                console.log(scope.parms);
                scope.getParms();
            });

            scope.show = function(evt, data){
                console.log(scope.parms);
                console.log(evt, data);
            }

            scope.sendParms = function(evt){
                $http({
                    method: 'POST',
                    url: "/configItParms",
                    data: JSON.stringify(scope.parms)
                }).success(function () {
                    //console.log("Restarting");
                });
            }
            scope.getParms();

            scope.changLang = function(lang){
                scope.parms.curLang = lang;
                //console.log(lang, scope.parms);
                scope.sendParms();
            }

            scope.$watch('parms.curLang', function(value) {
                   console.log("LANG:", value);
             });
        }// link

      };
    });
}
window['configLoaded'] = true;

