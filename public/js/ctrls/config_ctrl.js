
                                            
                                            
                                            
// @ngInject
function ConfigCtrl($scope, $rootScope, blocksStore, $http, $modalInstance, rapps) {

  var ctrl = this;
  this.blockConfigs = {};
  this.currentBlockConfig = '';

  this.rapps = rapps.rapps;



  this.rapps = rapps.rapps.map(function(rapp){
    var apps = R.keys(rapp.rocon_apps);
    return R.map(
      R.concat(rapp.name + "/")
    )(apps);
  });
  this.rapps = R.flatten(this.rapps);
  console.log(this.rapps);


  this.config = {
    remappings: [],
    parameters: []
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
