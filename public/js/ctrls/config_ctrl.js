
                                            
                                            
                                            
// @ngInject
function ConfigCtrl($scope, $rootScope, blocksStore, $http, $modalInstance, rapps) {

  var ctrl = this;
  this.blockConfigs = {};
  this.currentBlockConfig = '';

  this.rapps = rapps.rapps;
  this.config = {
    timeout: 15000,
    remappings: [],
    parameters: []
  }; 



  this.rapps = rapps.rapps.map(function(rapp){
    var apps = R.keys(rapp.rocon_apps);
    return R.map(
      R.concat(rapp.name + "/")
    )(apps);
  });
  this.rapps = R.flatten(this.rapps);
  console.log(this.rapps);

  this.rappSelected = function(item){
    var pair = item.split("/");
    var rapp = R.find(R.propEq('name', pair[0]))(rapps.rapps);
    var rocon_app = rapp['rocon_apps'][pair[1]];


    ctrl.config.parameters = [];
    ctrl.config.remappings = [];
    ctrl.config.timeout = 15000;
    ctrl.config.uri = null;

    ctrl.config.uri = rocon_app.compatibility;


    var names = JSONSelect.match('.public_interface .name', rocon_app)
    names.forEach(function(nm){
      var to = nm.match(/\/.+/) ? nm : "/"+nm;
      ctrl.config.remappings.push({remap_from: nm, remap_to: to});
    });


    if(rocon_app.public_parameters){
      ctrl.config.parameters = [];
      R.mapObj.idx(function(v, k){
        ctrl.config.parameters.push({key: k, value: v});
      })(rocon_app.public_parameters)

    }


  };

  this.addRemapping = function(){
    ctrl.config.remappings.push({remap_from: '', remap_to: ''});
  };
  this.deleteRemapping = function(idx){
    ctrl.config.remappings.splice(idx, 1);
  };
  this.addParameter = function(){
    ctrl.config.parameters.push({key: '', value: ''});
  };
  this.deleteParameter = function(idx){
    ctrl.config.parameters.splice(idx, 1);
  };

  if(Blockly.selected && Blockly.selected.extra_config){
    this.config = Blockly.selected.extra_config;
  }




  this.ok = function(){
    if(Blockly.selected){
      Blockly.selected.extra_config = ctrl.config;
    };
    $modalInstance.dismiss();

  };


};

module.exports = ConfigCtrl;
