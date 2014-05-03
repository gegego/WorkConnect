/** @jsx React.DOM */

// Simple pure-React component so we don't have to remember
// Bootstrap's classes
var BootstrapButton = React.createClass({
  render: function() {
    // transferPropsTo() is smart enough to merge classes provided
    // to this component.
    return this.transferPropsTo(

      < href="javascript:;" role="button" className="btn">
        {this.props.children}
      </a>
    );
  }
});

var BootstrapModal = React.createClass({
  // The following two methods are the only places we need to
  // integrate with Bootstrap or jQuery!
  componentDidMount: function() {
    // When the component is added, turn it into a modal
    $(this.getDOMNode())
      .modal({backdrop: 'static', keyboard: false, show: false})
  },
  componentWillUnmount: function() {
    $(this.getDOMNode()).off('hidden', this.handleHidden);
  },
  
  close: function() {
    $(this.getDOMNode()).modal('hide');
  },
  open: function() {
    $(this.getDOMNode()).modal('show');
  },
  render: function() {
    var confirmButton = null;
    var cancelButton = null;

    if (this.props.confirm) {
      confirmButton = (
        <BootstrapButton
          onClick={this.handleConfirm}
          className="btn-primary">
          {this.props.confirm}
        </BootstrapButton>
      );
    }
    if (this.props.cancel) {
      cancelButton = (
        <BootstrapButton onClick={this.handleCancel}>
          {this.props.cancel}
        </BootstrapButton>
      );
    }

    return (
      <div className="modal fade">
        <div className="modal-dialog">
          <div className="modal-content">      
            <div className="modal-header">
              <button
                type="button"
                className="close"
                onClick={this.handleCancel}
                dangerouslySetInnerHTML={{__html: '&times'}}
              />
              <h3>{this.props.title}</h3>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">
              {cancelButton}
              {confirmButton}
            </div>
          </div>
        </div>
      </div>
    );
  },
  handleCancel: function() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  },
  handleConfirm: function() {
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
  }
});

var Example = React.createClass({
  handleCancel: function() {
    if (confirm('Are you sure you want to cancel?')) {
      this.refs.modal.close();
    }
  },
  render: function() {
    var modal = null;
    modal = (
      <BootstrapModal
        ref="modal"
        confirm="OK"
        cancel="Cancel"
        onCancel={this.handleCancel}
        onConfirm={this.closeModal}
        title="Applet Data">
          {this.props.appletData}
      </BootstrapModal>
    );
    return (
      <div className="example">
        {modal}
        <BootstrapButton onClick={this.openModal}>{this.props.openButtonName}</BootstrapButton>
      </div>
    );
  },
  openModal: function() {
    this.refs.modal.open();
  },
  closeModal: function() {
    this.refs.modal.close();
  }
});

///////////////////////////////////////
var Applet0= React.createClass({
    helloServer: function(){
        // Give the server out applet values
        wsO.send(this.props.data);
    },
    getInitialState: function() {
        // Callback to update the applet
        var setPosState = function(msg){
            this.state.viewData["pos"] = msg.value;
            this.state.progressPos = parseInt(msg.value) % 133;
            //console.log(this.state.progressPos);
            this.state.progressStyle.width= this.state.progressPos + "%";
            this.setState(this.state);
        }.bind(this);

        // register for an event
        wsO.reg("pos", setPosState);
        return {
            data: this.props.data, 
            viewData: {},
            progressStyle: {
                width: "45%"
            },
            progressPos: 0
        };
    },  
    clickHandler: function() {
        wsO.send({evt: "showViewData", value: this.state.viewData});
    },

    setTitle: function() {
        return this.props.data["AppletTitle"];
    },

    render: function() {
        var counter=0;
        var nodes = _.map(this.state.data, function (value, key) {
            counter += 1;
            var lineClass = "appletKeyValueEven";
            if(counter & 1 == 1){
                lineClass = "appletKeyValueOdd";
            }
            return <div className={lineClass}>
                <span className="appletKey">{key}&nbsp;=&nbsp;</span>
                <span className="appletValue">{value}</span>
                </div>     
        });

        this.appletDataRender=(<div className="appletData" id={this.props.data["nexPertAppletID"]+"Data"}>
                                {nodes}
                              </div>
                         );

return (
  <div className="Applet0">
    <div className="panel panel-primary">
    <div className="panel-heading">{this.setTitle()}</div>
    <div className="panel-body">        
    <Example appletData = {this.appletDataRender} openButtonName="Show Applet Parms"></Example>
    <button onClick={this.clickHandler}>SendToServer</button><span>{this.state.viewData}</span>
    <div className="progress progress-striped active">
      <div className="progress-bar"  role="progressbar" aria-valuenow={this.state.progressPos}aria-valuemin="0" aria-valuemax="100" style={this.state.progressStyle}>
        <span className="sr-only">{this.state.progressPos}% Complete</span>
      </div>
    </div>        
    </div>
    </div>
  </div>
    );
}
});


// ServiceSession - D1SP07
var Applet_D1SP07 = React.createClass({
  helloServer: function(){
    // Give the server out applet values
    wsO.send(this.props.data);
  },
  getInitialState: function() {
    // Callback to update the applet
    var setPosState = function(msg){
      this.state.viewData["pos"] = msg.value;
      this.state.progressPos = parseInt(msg.value) % 133;
      //console.log(this.state.progressPos);
      this.state.progressStyle.width= this.state.progressPos + "%";
      this.setState(this.state);
    }.bind(this);

    // register for an event
    wsO.reg("pos", setPosState);
    return {
          data: this.props.data, 
          viewData: {},
          progressStyle: {
            width: "45%"
          },
          progressPos: 0
        };
  },  
  clickHandler: function() {
    wsO.send({evt: "showViewData", value: this.state.viewData});
  },
  
  D1SP07_1003: function() {
    console.log("Stop Press: ");
	alert("D1SP07_1003: Stop Press");
  },
  
  D1SP07_1002: function() {
    console.log("Stop Service Session");
	alert("D1SP07_1002: Stop Service Session");
  },
  
  D1SP07_1001: function() {
	console.log("Start Service Session");
	alert("D1SP07_1001: Start Service Session");
  },
  
  D1SP07_1004: function() {
	console.log("Disable Auto Cycle");
	alert("D1SP07_1004: Disable Auto Cycle");
  },
  
  setTitle: function() {
      return this.props.data["AppletTitle"];
  },

  render: function() {
    var counter=0;
    var nodes = _.map(this.state.data, function (value, key) {
      counter += 1;
      var lineClass = "appletKeyValueEven";
      if(counter & 1 == 1){
        lineClass = "appletKeyValueOdd";
      }
      return <div className={lineClass}>
          <span className="appletKey">{key}&nbsp;=&nbsp;</span>
          <span className="appletValue">{value}</span>
          </div>     
    });

    this.appletDataRender=(<div className="appletData" id={this.props.data["nexPertAppletID"]+"Data"}>
                              {nodes}
                            </div>
                         );

    return (
      <div className="Applet0">
        <div className="panel panel-primary">
        <div className="panel-heading">{this.setTitle()}</div>
        <div className="panel-body">        
        <Example appletData = {this.appletDataRender} openButtonName="Show Applet Parms"></Example>
        <button onClick={this.clickHandler}>SendToServer</button><span>{this.state.viewData}</span>
        <div className="progress progress-striped active">
          <div className="progress-bar"  role="progressbar" aria-valuenow={this.state.progressPos}aria-valuemin="0" aria-valuemax="100" style={this.state.progressStyle}>
            <span className="sr-only">{this.state.progressPos}% Complete</span>
          </div>
        </div>    	
		<div>
			<button className="stopPress" onClick={this.D1SP07_1003}>STOP PRESS</button>
			<button className="Group3ButtonLeftButton" onClick={this.D1SP07_1002}>Stop</button>
			<button className="Group3ButtonMiddleButton" onClick={this.D1SP07_1001}>Start</button>
			<button className="Group3ButtonRightButton" onClick={this.D1SP07_1004}>Disable Auto Cycle</button>
		</div>
        </div>
        </div>
      </div>
    );
  }
});

// Substrate Intrack Calibration - R40A09
var Applet_R40A09 = React.createClass({
  helloServer: function(){
    // Give the server out applet values
    wsO.send(this.props.data);
  },
  getInitialState: function() {
    // Callback to update the applet
    var setPosState = function(msg){
      this.state.viewData["pos"] = msg.value;
      this.state.progressPos = parseInt(msg.value) % 133;
      //console.log(this.state.progressPos);
      this.state.progressStyle.width= this.state.progressPos + "%";
      this.setState(this.state);
    }.bind(this);

    // register for an event
    wsO.reg("pos", setPosState);
    return {
          data: this.props.data, 
          viewData: {},
          progressStyle: {
            width: "45%"
          },
          progressPos: 0
        };
  },  
  clickHandler: function() {
    wsO.send({evt: "showViewData", value: this.state.viewData});
  },
  
  D1SP07_1003: function() {
    console.log("Stop Press");
	alert("R40A09_1003: Stop Press");
  },
  
  R40A09_1002: function() {
    console.log("stopSIC Press");
	alert("R40A09_1002: Stop SIC");
  },
  
  R40A09_1001: function() {
	console.log("startSIC Press");
	alert("R40A09_1001: Start SIC");
  },
  
  setTitle: function() {
      return this.props.data["AppletTitle"];
  },

  render: function() {
    var counter=0;
    var nodes = _.map(this.state.data, function (value, key) {
      counter += 1;
      var lineClass = "appletKeyValueEven";
      if(counter & 1 == 1){
        lineClass = "appletKeyValueOdd";
      }
      return <div className={lineClass}>
          <span className="appletKey">{key}&nbsp;=&nbsp;</span>
          <span className="appletValue">{value}</span>
          </div>     
    });

    this.appletDataRender=(<div className="appletData" id={this.props.data["nexPertAppletID"]+"Data"}>
                              {nodes}
                            </div>
                         );

    return (
      <div className="Applet2">
        <div className="panel panel-primary">
        <div className="panel-heading">{this.setTitle()}</div>
        <div className="panel-body">        
        <Example appletData = {this.appletDataRender} openButtonName="Show Applet Parms"></Example>
        <button onClick={this.clickHandler}>SendToServer</button><span>{this.state.viewData}</span>
        <div className="progress progress-striped active">
          <div className="progress-bar"  role="progressbar" aria-valuenow={this.state.progressPos}aria-valuemin="0" aria-valuemax="100" style={this.state.progressStyle}>
            <span className="sr-only">{this.state.progressPos}% Complete</span>
          </div>
        </div>    	
		<div class="row">
			<label class="radio-inline">
			<input name="radioGroup" id="83ppm" value="option1" type="radio" > 83 ppm&nbsp;&nbsp;&nbsp;</input>
			</label>
			<label class="radio-inline">
			<input name="radioGroup" id="100ppm" value="option2" type="radio" > 100 ppm&nbsp;&nbsp;&nbsp;</input>
			</label>
			<label class="radio-inline">
			<input name="radioGroup" id="120ppm" value="option3" type="radio"> 120 ppm</input>
			</label>
		</div>
		<p></p>	   
		<div class="checkbox">
			<label><input type="checkbox" name="supply1" id="supply1" value="A">&nbsp;A&nbsp;&nbsp;&nbsp;</input></label>
			<label><input type="checkbox" name="supply2" id="supply2" value="B">&nbsp;B&nbsp;&nbsp;&nbsp;</input></label>
			<label><input type="checkbox" name="supply3" id="supply3" value="D">&nbsp;D&nbsp;&nbsp;&nbsp;</input></label>
			<label><input type="checkbox" name="supply4" id="supply4" value="E">&nbsp;E</input></label>
		</div>
		<div>
			<button className="stopPress" onClick={this.D1SP07_1001}>STOP PRESS</button>
			<button className="Group2ButtonLeftButton" onClick={this.R40A09_1002}>Stop</button>
			<button className="Group2ButtonRightButton" onClick={this.R40A09_1001}>Start</button>
		</div>
        </div>
        </div>
      </div>
    );
  }
});

// Counters - L1SP07
var Applet_L1SP07 = React.createClass({
  helloServer: function(){
    // Give the server out applet values
    wsO.send(this.props.data);
  },
  getInitialState: function() {
    // Callback to update the applet
    var setPosState = function(msg){
      this.state.viewData["pos"] = msg.value;
      this.state.progressPos = parseInt(msg.value) % 133;
      //console.log(this.state.progressPos);
      this.state.progressStyle.width= this.state.progressPos + "%";
      this.setState(this.state);
    }.bind(this);

    // register for an event
    wsO.reg("pos", setPosState);
    return {
          data: this.props.data, 
          viewData: {},
          progressStyle: {
            width: "45%"
          },
          progressPos: 0
        };
  },  	
  clickHandler: function() {
    wsO.send({evt: "showViewData", value: this.state.viewData});
  },
  
  L1SP07_0003: function() {
	alert("L1SP07_0003: Help Counter");
  },
  
  L1SP07_0002: function() {
	alert("L1SP07_0002: Export Counter");
  },
  
  L1SP07_0001: function() {
	alert("L1SP07_0001: Refresh Counter");
  },
  
  setTitle: function() {
      return this.props.data["AppletTitle"];
  },

  render: function() {
    var counter=0;
    var nodes = _.map(this.state.data, function (value, key) {
      counter += 1;
      var lineClass = "appletKeyValueEven";
      if(counter & 1 == 1){
        lineClass = "appletKeyValueOdd";
      }
      return <div className={lineClass}>
          <span className="appletKey">{key}&nbsp;=&nbsp;</span>
          <span className="appletValue">{value}</span>
          </div>     
    });

    this.appletDataRender=(<div className="appletData" id={this.props.data["nexPertAppletID"]+"Data"}>
                              {nodes}
                            </div>
                         );

    return (
    <div className="Applet3">
        <div className="panel panel-primary">
        <div className="panel-heading">{this.setTitle()}</div>
        <div className="panel-body">        
        <Example appletData = {this.appletDataRender} openButtonName="Show Applet Parms"></Example>
        <button onClick={this.clickHandler}>SendToServer</button><span>{this.state.viewData}</span>       
			<ul id="substrateCounters" className="nav nav-tabs">
				<li className="active"><a href="#Totaltab" data-toggle="tab">Total</a></li>
				<li><a href="#FiveColortab" data-toggle="tab">Five Color Mode</a></li>
				<li><a href="#BlackModetab" data-toggle="tab">Black Mode</a></li>
				<li><a href="#EconomyModetab" data-toggle="tab">Economy Mode</a></li>
				<li><a href="#BlackDetectedtab" data-toggle="tab">Black Detected</a></li>
				<li><a href="#BlankDetectedtab" data-toggle="tab">Blank Detected</a></li>
				<li><a href="#ServiceModetab" data-toggle="tab">Service Mode</a></li>
			</ul>
			<div id="counterTabContents" className="tab-content">
				<div className="tab-pane fade in active" id="Totaltab">
					<table className="table table-bordered table-hover">
						<thead><tr><th>Sheet Type</th><th>Total</th></tr></thead>
						<tbody>
							<tr><td>Total Surfaces Detected</td><td>0</td></tr>
							<tr><td>Equivalent A4</td><td>0</td></tr>
							<tr><td>Simplex Less Equal A4</td><td>0</td></tr>
							<tr><td>Simplex Greater Than A4</td><td>0</td></tr>
							<tr><td>Simplex 3x A4</td><td>0</td></tr>
							<tr><td>Simplex 4x A4</td><td>0</td></tr>
							<tr><td>Duplex Less Equal A4</td><td>0</td></tr>
							<tr><td>Duplex Greater Than A4</td><td>0</td></tr>							
							<tr><td>Duplex 3x A4</td><td>0</td></tr>							
							<tr><td>Duplex 4x A4</td><td>0</td></tr>
						</tbody>
					</table>
				</div>
				<div className="tab-pane fade" id="FiveColortab">
					<table className="table table-bordered table-hover">
					<thead><tr><th>Sheet Type</th><th>Total</th></tr></thead>
					<tbody>
						<tr><td>5 Color Mode Equivalent A4</td><td>0</td></tr>
						<tr><td>5 Color Mode Simplex Surface Less Equal A4</td><td>0</td></tr>
						<tr><td>5 Color Mode Simplex Surface Greater Than A4</td><td>0</td></tr>						
						<tr><td>5 Color Mode Simplex Surface 3x A4</td><td>0</td></tr>
						<tr><td>5 Color Mode Simplex Surface 4x A4</td><td>0</td></tr>
						<tr><td>5 Color Mode Duplex Surface Less Equal A4</td><td>0</td></tr>
						<tr><td>5 Color Mode Duplex Surface Greater Than A4</td><td>0</td></tr>
						<tr><td>5 Color Mode Duplex Surface 3x A4</td><td>0</td></tr>						
						<tr><td>5 Color Mode Duplex Surface 4x A4</td><td>0</td></tr>
					</tbody>					
					</table>
				</div>
				<div className="tab-pane fade" id="BlackModetab">
					<table className="table table-bordered table-hover">	
					<thead><tr><th>Sheet Type</th><th>Total</th></tr></thead>
					<tbody>
						<tr><td>Black Mode Equivalent A4</td><td>0</td></tr>
						<tr><td>Black Mode Simplex Surface Less Equal A4</td><td>0</td></tr>
						<tr><td>Black Mode Simplex Surface Greater Than A4</td><td>0</td></tr>						
						<tr><td>Black Mode Simplex Surface 3x A4</td><td>0</td></tr>
						<tr><td>Black Mode Simplex Surface 4x A4</td><td>0</td></tr>
						<tr><td>Black Mode Duplex Surface Less Equal A4</td><td>0</td></tr>
						<tr><td>Black Mode Duplex Surface Greater Than A4</td><td>0</td></tr>
						<tr><td>Black Mode Duplex Surface 3x A4</td><td>0</td></tr>						
						<tr><td>Black Mode Duplex Surface 4x A4</td><td>0</td></tr>
					</tbody>								
					</table>
				</div>
				<div className="tab-pane fade" id="EconomyModetab">
					<table className="table table-bordered table-hover">	
					<thead><tr><th>Sheet Type</th><th>Total</th></tr></thead>
					<tbody>
						<tr><td>Economy Mode Equivalent A4</td><td>0</td></tr>
						<tr><td>Economy Mode Simplex Surface Less Equal A4</td><td>0</td></tr>
						<tr><td>Economy Mode Simplex Surface Greater Than A4</td><td>0</td></tr>						
						<tr><td>Economy Mode Simplex Surface 3x A4</td><td>0</td></tr>
						<tr><td>Economy Mode Simplex Surface 4x A4</td><td>0</td></tr>
						<tr><td>Economy Mode Duplex Surface Less Equal A4</td><td>0</td></tr>
						<tr><td>Economy Mode Duplex Surface Greater Than A4</td><td>0</td></tr>
						<tr><td>Economy Mode Duplex Surface 3x A4</td><td>0</td></tr>						
						<tr><td>Economy Mode Duplex Surface 4x A4</td><td>0</td></tr>
					</tbody>								
					</table>
				</div>
				<div className="tab-pane fade" id="BlackDetectedtab">
				<table className="table table-bordered table-hover">	
					<thead><tr><th>Sheet Type</th><th>Total</th></tr></thead>
					<tbody>
						<tr><td>Black Surfaces Detected</td><td>0</td></tr>
						<tr><td>Black Equivalent A4 Detected</td><td>0</td></tr>
						<tr><td>Black Simplex Surface Less Equal A4 Detected</td><td>0</td></tr>						
						<tr><td>Black Simplex Surface Greater Than A4 Detected</td><td>0</td></tr>
						<tr><td>Black Simplex Surface 3x A4 Detected</td><td>0</td></tr>
						<tr><td>Black Simplex Surface 4x A4 Detected</td><td>0</td></tr>
						<tr><td>Black Duplex Surface Less Equal A4 Detected</td><td>0</td></tr>
						<tr><td>Black Duplex Surface Greater Than A4 Detected</td><td>0</td></tr>						
						<tr><td>Black Duplex Surface 3x A4 Detected</td><td>0</td></tr>						
						<tr><td>Black Duplex Surface 4x A4 Detected</td><td>0</td></tr>
					</tbody>								
					</table>
				</div>
				<div className="tab-pane fade" id="BlankDetectedtab">
				<table className="table table-bordered table-hover">	
					<thead><tr><th>Sheet Type</th><th>Total</th></tr></thead>
					<tbody>
						<tr><td>Blank Surfaces Detected</td><td>0</td></tr>
						<tr><td>Blank Equivalent A4 Detected</td><td>0</td></tr>
						<tr><td>Blank Simplex Surface Less Equal A4 Detected</td><td>0</td></tr>						
						<tr><td>Blank Simplex Surface Greater Than A4 Detected</td><td>0</td></tr>
						<tr><td>Blank Simplex Surface 3x A4 Detected</td><td>0</td></tr>
						<tr><td>Blank Simplex Surface 4x A4 Detected</td><td>0</td></tr>
						<tr><td>Blank Duplex Surface Less Equal A4 Detected</td><td>0</td></tr>
						<tr><td>Blank Duplex Surface Greater Than A4 Detected</td><td>0</td></tr>						
						<tr><td>Blank Duplex Surface 3x A4 Detected</td><td>0</td></tr>						
						<tr><td>Blank Duplex Surface 4x A4 Detected</td><td>0</td></tr>
					</tbody>								
					</table>
				</div>
				<div className="tab-pane fade" id="ServiceModetab">
				<table className="table table-bordered table-hover">	
					<thead><tr><th>Sheet Type</th><th>Total</th></tr></thead>
					<tbody>
						<tr><td>Service Mode Equivalent A4</td><td>0</td></tr>
						<tr><td>Service Mode Simplex Less Equal A4</td><td>0</td></tr>						
						<tr><td>Service Mode Simplex Greater Than A4</td><td>0</td></tr>
						<tr><td>Service Mode Simplex 3x A4</td><td>0</td></tr>
						<tr><td>Service Mode Simplex 4x A4</td><td>0</td></tr>
						<tr><td>Service Mode Duplex Less Equal A4</td><td>0</td></tr>
						<tr><td>Service Mode Duplex Greater Than A4</td><td>0</td></tr>						
						<tr><td>Service Mode Duplex 3x A4</td><td>0</td></tr>						
						<tr><td>Service Mode Duplex 4x A4</td><td>0</td></tr>
					</tbody>								
					</table>
				</div>
			</div>
			<div classname="counter">
				<button className="heloCounter" onClick={this.L1SP07_0003}>?</button>
				<button className="exportButtons" onClick={this.L1SP07_0002}>Export</button>
				<button className="refreshButtons" onClick={this.L1SP07_0001}>Refresh</button>
			</div>
		</div>			
        </div>
      </div>
    );
  }
});
	
// Cycle Engine to State - L1SP07
var Applet_L1SP06 = React.createClass({
    helloServer: function(){
        // Give the server out applet values
        wsO.send(this.props.data);
    },
    getInitialState: function() {
        // Callback to update the applet
        var setPosState = function(msg){
            this.state.viewData["pos"] = msg.value;
            this.state.progressPos = parseInt(msg.value) % 133;
            //console.log(this.state.progressPos);
            this.state.progressStyle.width= this.state.progressPos + "%";
            this.setState(this.state);
        }.bind(this);

        // register for an event
        wsO.reg("pos", setPosState);
        return {
            data: this.props.data, 
            viewData: {},
            progressStyle: {
                width: "45%"
            },
            progressPos: 0
        };
    },  
    clickHandler: function() {
        wsO.send({evt: "showViewData", value: this.state.viewData});
    },
  
    D1SP07_1001: function() {
        console.log("Start service session");
        alert("L1SP06_1001: Start service session");
    },

    D1SP07_1002: function() {
        console.log("Stop service session");
        alert("L1SP06_1002: Stop service session");
    },

    D1SP07_1003: function() {
        console.log("Stop Press");
        alert("L1SP06_1003: Stop Press");
    },
  
    L1SP06_1001: function() {
        console.log("Ready");
        alert("L1SP06_1004: Ready");
    },
  
    L1SP06_1002: function() {
        console.log("standBy");
        alert("L1SP06_1005: standBy");
    },

    L1SP06_1003: function() {
        console.log("powerSave");
        alert("L1SP06_1006: powerSave");
    },
  
    L1SP06_1004: function() {
        console.log("Error State");
        alert("L1SP06_1007: Error State");
    },
  
    setTitle: function() {
        return this.props.data["AppletTitle"];
    },

    render: function() {
        var counter=0;
        var nodes = _.map(this.state.data, function (value, key) {
            counter += 1;
            var lineClass = "appletKeyValueEven";
            if(counter & 1 == 1){
                lineClass = "appletKeyValueOdd";
            }
            return <div className={lineClass}>
                <span className="appletKey">{key}&nbsp;=&nbsp;</span>
                <span className="appletValue">{value}</span>
                </div>     
        });

        this.appletDataRender=(<div className="appletData" id={this.props.data["nexPertAppletID"]+"Data"}>
                                {nodes}
                                </div>
                            );

    return (
        <div className="Applet4">
        <div className="panel panel-primary">
        <div className="panel-heading">{this.setTitle()}</div>
        <div className="panel-body">        
        <Example appletData = {this.appletDataRender} openButtonName="Show Applet Parms"></Example>
        <button onClick={this.clickHandler}>SendToServer</button><span>{this.state.viewData}</span>	
        <div>
            <h4>Service Session Control</h4>
            <button className="Group2ButtonLeftButton" onClick={this.D1SP07_1002}>Stop</button>
		    <button className="Group2ButtonRightButton" onClick={this.D1SP07_1001}>Start</button>
            <h5>Press Status:<small>Stand-By</small></h5>
        </div>
	    <div>
            <fieldset><legend> </legend>
		    <button className="stopPress" onClick={this.D1SP07_1003}>STOP PRESS</button>
		    <button className="Group4Button1" onClick={this.L1SP06_1001}>Ready</button>
		    <button className="Group4Button2" onClick={this.L1SP06_1002}>Stand-By</button>
		    <button className="Group4Button3" onClick={this.L1SP06_1003}>Power Save</button>
            <button className="Group4Button4" onClick={this.L1SP06_1004}>Error</button>
            </fieldset>
	    </div>
        </div>
        </div>
        </div>
    );
    }
});


// Service Session Applet
loadApplet_D1SP07 = function(appletData){
  var app = "Applet_D1SP07";
  var allApplets={
    Applet_D1SP07 : Applet_D1SP07
  };
  var appletId = "appletData_"+appletData.nexPertAppletID;
  console.log(appletData);
  var r = allApplets[app](
      {data : appletData} );
  console.log("RR:", r);
  React.renderComponent(r, document.getElementById(appletId));
  r.helloServer();
}

// Substrate Intrack Carlibration - R40A09
loadApplet_R40A09 = function(appletData){
  var app = "Applet_R40A09";
  var allApplets={
    Applet_R40A09 : Applet_R40A09
  };
  var appletId = "appletData_"+appletData.nexPertAppletID;
  console.log(appletData);
  var r = allApplets[app](
      {data : appletData} );

  console.log("RR:", r);
  React.renderComponent(r, document.getElementById(appletId));
  r.helloServer();
}

// Page Counter - L1SP07
loadApplet_L1SP07 = function(appletData){
  var app = "Applet_L1SP07";
  var allApplets={
    Applet_L1SP07 : Applet_L1SP07
  };
  var appletId = "appletData_"+appletData.nexPertAppletID;
  console.log(appletData);
  var r = allApplets[app](
      {data : appletData} );

  console.log("RR:", r);
  React.renderComponent(r, document.getElementById(appletId));
  r.helloServer();
}

// Cycle engine to state
loadApplet_L1SP06 = function(appletData){
    var app = "Applet_L1SP06";
    var allApplets={
        Applet_L1SP06 : Applet_L1SP06
    };
    var appletId = "appletData_"+appletData.nexPertAppletID;
    console.log(appletData);
    var r = allApplets[app](
        {data : appletData} );

    console.log("RR:", r);
    React.renderComponent(r, document.getElementById(appletId));
    r.helloServer();
}