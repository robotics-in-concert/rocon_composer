
var app = angular.module('centoAuthoring');
app.controller('ConfigCtrl', function($scope, blocksStore, $http) {
  console.log('x');

    $scope.blockConfigs = {};
    $scope.currentBlockConfig = '';

    var editor = $scope.editor = new JSONEditor($('#config-editor').get(0), {
      disable_array_reorder: true,
      disable_collapse: true,
      disable_edit_json: true,
      disable_properties: true,
      schema: {
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
      }
      
    });
    var default_value = editor.getValue();
    window.editor = editor;

    editor.on('change', function(){
      if(Blockly.selected){
        Blockly.selected.extra_config = editor.getValue();
      };
    });

    Blockly.mainWorkspace.getCanvas().addEventListener('blocklySelectChange', function(){
      editor.setValue(default_value);
      console.log("DEF", default_value);


      if(Blockly.selected){
        var cfg = Blockly.selected.extra_config;


        if(cfg){
          editor.setValue(R.mixin(default_value, cfg));

        }else{
          // var v = editor.getValue()
          // v.remappings = [];
          editor.setValue(default_value);
          // editor.setValue({remappings: []});
        }
      }

    });


});
