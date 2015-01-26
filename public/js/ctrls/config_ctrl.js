
                                            
                                            
                                            
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


  this.schema = blocksStore.loadRapp().then(function(){
    var schema = {
      title: 'blockconfig',
      type: "object",
      properties: {
        rapp: {type: 'string'},
        uri: {type: 'string'},
        timeout: {
          type: 'integer',
          default: 15000
        },
        remappings: { 
          type: 'array',
          format: 'table',
          title: 'Remappings',
          items: {
            type: 'object',
            properties: {
              remap_from: {type: 'string'},
              remap_to: {type: 'string'}
            }

          }
        },
        parameters: { 
          type: 'array',
          format: 'table',
          title: 'Parameters',
          items: {
            type: 'object',
            properties: {
              key: {type: 'string'},
              value: {type: 'string'}
            }

          }
        },
      }
    };


    return schema;
  });
  


  this.startval = null;

  if(Blockly.selected && Blockly.selected.extra_config){
    this.startval = Blockly.selected.extra_config;
  }



  this.editor_options = {
    disable_array_reorder: true,
    disable_collapse: true,
    disable_edit_json: true,
    disable_properties: true
  };





  // var editor = this.editor = new JSONEditor($('#config-editor').get(0), {
    // disable_array_reorder: true,
    // disable_collapse: true,
    // disable_edit_json: true,
    // disable_properties: true,
    // schema: 
    
  // });
  // var default_value = editor.getValue();
  // window.editor = editor;

  this.onChange = function(data){
    console.log(data);
    ctrl.value = data;
  };

  this.ok = function(){
    if(Blockly.selected){
      Blockly.selected.extra_config = ctrl.value;
    };
    $mi.dismiss();

  };


};

module.exports = ConfigCtrl;
