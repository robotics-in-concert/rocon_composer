
                                            
                                            
                                            
ConfigCtrl.$inject = ['$scope', 'blocksStore', '$http', '$modalInstance'];                                            

function ConfigCtrl($scope, blocksStore, $http, $mi) {
  console.log('x');


  var ctrl = this;
  this.blockConfigs = {};
  this.currentBlockConfig = '';


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
    $mi.dismiss();

  };


};

module.exports = ConfigCtrl;
