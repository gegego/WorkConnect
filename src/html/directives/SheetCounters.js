
/*
<script src='/directives/Sheetcounters.js'></script>
<Sheetcounters 
    AppletTitle='COUNTERS' 
    Locale='en' 
    PollTime='60' 
    ROParam1='04010F55' 
    ROParam2='04010F51' 
    ROParam3='04010F52' 
    ROParam4='04010F53' 
    ROParam5='04010F54' 
    TemplateName='SheetCounters' 
    fn='C:/work/NewNexpert/lang/en/p1service/p1/spu/ser_sw/L/l1sp07.asp' 
    helpURL='../../p1/spu/app_help/L/L1SP07.asp' 
    nexPertAppletID='c8c2cede_a85a_11e3_a7f2_6eae8b15c5b5' 
    swprog='L1SP07' >

</Sheetcounters>

*/
if(window['sheetcountersLoaded'] == undefined){
    workconnectApp.directive('sheetcounters', function($rootScope, udpMsgs, $http, $timeout){
        var header = ["Sheet Type","Total"];
        var tabs=[
            {name:"Total",
                values:[
                    {name:"Total Surfaces Detected", value:0},
                    {name:"Equivalent A4", value:0},
                    {name:"Simplex Less Equal A4", value:0},
                    {name:"Simplex Greater Than A4", value:0},
                    {name:"Simplex 3x A4", value:0},
                    {name:"Simplex 4x A4", value:0},
                    {name:"Duplex Less Equal A4", value:0},
                    {name:"Duplex Greater Than A4", value:0},                          
                    {name:"Duplex 3x A4", value:0},                            
                    {name:"Duplex 4x A4", value:0}
            ]},
            {name:"Five Color Mode",
            values:[
                {name:"5 Color Mode Equivalent A4", value:0},
                {name:"5 Color Mode Simplex Surface Less Equal A4", value:0},
                {name:"5 Color Mode Simplex Surface Greater Than A4", value:0},                        
                {name:"5 Color Mode Simplex Surface 3x A4", value:0},
                {name:"5 Color Mode Simplex Surface 4x A4", value:0},
                {name:"5 Color Mode Duplex Surface Less Equal A4", value:0},
                {name:"5 Color Mode Duplex Surface Greater Than A4", value:0},
                {name:"5 Color Mode Duplex Surface 3x A4", value:0},                       
                {name:"5 Color Mode Duplex Surface 4x A4", value:0}
            ]},
            {name:"Black Mode",
            values:[
                {name:"Black Mode Equivalent A4", value:0},
                {name:"Black Mode Simplex Surface Less Equal A4", value:0},
                {name:"Black Mode Simplex Surface Greater Than A4", value:0},                      
                {name:"Black Mode Simplex Surface 3x A4", value:0},
                {name:"Black Mode Simplex Surface 4x A4", value:0},
                {name:"Black Mode Duplex Surface Less Equal A4", value:0},
                {name:"Black Mode Duplex Surface Greater Than A4", value:0},
                {name:"Black Mode Duplex Surface 3x A4", value:0},                     
                {name:"Black Mode Duplex Surface 4x A4", value:0}
            ]},
            {name:"Economy Mode",
            values:[
                {name:"Economy Mode Equivalent A4", value:0},
                {name:"Economy Mode Simplex Surface Less Equal A4", value:0},
                {name:"Economy Mode Simplex Surface Greater Than A4", value:0},                        
                {name:"Economy Mode Simplex Surface 3x A4", value:0},
                {name:"Economy Mode Simplex Surface 4x A4", value:0},
                {name:"Economy Mode Duplex Surface Less Equal A4", value:0},
                {name:"Economy Mode Duplex Surface Greater Than A4", value:0},
                {name:"Economy Mode Duplex Surface 3x A4", value:0},                       
                {name:"Economy Mode Duplex Surface 4x A4", value:0}
            ]},
            {name:"Black Detected",
            values:[
                {name:"Black Surfaces Detected", value:0},
                {name:"Black Equivalent A4 Detected", value:0},
                {name:"Black Simplex Surface Less Equal A4 Detected", value:0},                        
                {name:"Black Simplex Surface Greater Than A4 Detected", value:0},
                {name:"Black Simplex Surface 3x A4 Detected", value:0},
                {name:"Black Simplex Surface 4x A4 Detected", value:0},
                {name:"Black Duplex Surface Less Equal A4 Detected", value:0},
                {name:"Black Duplex Surface Greater Than A4 Detected", value:0},                       
                {name:"Black Duplex Surface 3x A4 Detected", value:0},                     
                {name:"Black Duplex Surface 4x A4 Detected", value:0}
            ]},
            {name:"Blank Detected",
            values:[
                {name:"Blank Surfaces Detected", value:0},
                {name:"Blank Equivalent A4 Detected", value:0},
                {name:"Blank Simplex Surface Less Equal A4 Detected", value:0},                        
                {name:"Blank Simplex Surface Greater Than A4 Detected", value:0},
                {name:"Blank Simplex Surface 3x A4 Detected", value:0},
                {name:"Blank Simplex Surface 4x A4 Detected", value:0},
                {name:"Blank Duplex Surface Less Equal A4 Detected", value:0},
                {name:"Blank Duplex Surface Greater Than A4 Detected", value:0},                       
                {name:"Blank Duplex Surface 3x A4 Detected", value:0},                     
                {name:"Blank Duplex Surface 4x A4 Detected", value:0},
            ]},
            {name:"Service Mode",
            values:[
                {name:"Service Mode Equivalent A4", value:0},
                {name:"Service Mode Simplex Less Equal A4", value:0},                      
                {name:"Service Mode Simplex Greater Than A4", value:0},
                {name:"Service Mode Simplex 3x A4", value:0},
                {name:"Service Mode Simplex 4x A4", value:0},
                {name:"Service Mode Duplex Less Equal A4", value:0},
                {name:"Service Mode Duplex Greater Than A4", value:0},                     
                {name:"Service Mode Duplex 3x A4", value:0},                       
                {name:"Service Mode Duplex 4x A4", value:0},
            ]}
        ];

      return {
        scope: true,
        restrict: 'E',
        replace: true,
        templateUrl: "/partials/sheetcounters.html",
        link: function(scope, iElement, iAttrs) {
            scope.tabs = tabs;
            scope.header = header;
            scope.AppletTitle= iAttrs['applettitle'];
            scope.TemplateName= iAttrs['templatename'];
            scope.myId= iAttrs['myid'];
            
			var msg = copyObject(iAttrs);
            msg["evt"] = "getSheetCount";
            msg["nexPertAppletID"] = msg["nexpertappletid"]
            msg["commandID"] = "L1SP07_0001";			
			wsO.send(msg);
			
			// var msg = copyObject(iAttrs);
            // msg["evt"] = "EVT_SCSE_10002";
            // msg["nexPertAppletID"] = msg["nexpertappletid"]		
			// wsO.send(msg);
			
            scope.$on("EVT_SCSE_10001", function(evt, msg){
                console.log("SheetCntr", msg.value);
				for(var xx=0; xx < scope.tabs.length; xx++){					
					var pagetab = scope.tabs[xx].values;
					for(var yy=0; yy<pagetab.length; yy++)
					{
						if(msg.value[pagetab[yy].name] != null)
							pagetab[yy].value = msg.value[pagetab[yy].name];
					}					
				}
				
                scope.$digest();
            });
			
			scope.refreshSheetCounts = function(){
                var msg = copyObject(iAttrs);
				msg["evt"] = "getSheetCount";
				msg["nexPertAppletID"] = msg["nexpertappletid"]
				msg["commandID"] = "L1SP07_0001";
				wsO.send(msg);
			}
			
			scope.getTimeStamp = function() {
				var now = new Date();
				return (now.getFullYear() + '-' +
						(now.getMonth() + 1) + '-' +
						 (now.getDate()) + " " +
						 now.getHours() + ':' +
						 ((now.getMinutes() < 10)
							 ? ("0" + now.getMinutes())
							 : (now.getMinutes())) + ':' +
						 ((now.getSeconds() < 10)
							 ? ("0" + now.getSeconds())
							 : (now.getSeconds())));
			}
			
			var exportStr = "";
			scope.tabTOCsv = function() {				
				exportStr = "Count Reported generated on:,";
				exportStr += scope.getTimeStamp() + "\r\n";
				for(var xx=0; xx < scope.tabs.length; xx++){
					exportStr += "\r\n" + scope.tabs[xx].name + " List:\r\n";
					var pagetab = scope.tabs[xx].values;					
					for(var yy=0; yy<pagetab.length; yy++)
					{
						exportStr += pagetab[yy].name + ",";
						exportStr += pagetab[yy].value + "\r\n";
					}					
				}
			}	   

			scope.exportCsv = function(){
				scope.tabTOCsv();
				var array = new Array();
				array[0] = exportStr;
				var blob = new Blob(array, {type: "text/csv;charset=utf-8"});
				saveAs(blob, "NexPressCounters.csv");				
			}			
        }

      };
    });
}
window['sheetcountersLoaded'] = true;

