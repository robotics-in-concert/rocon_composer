
var app = angular.module('centoAuthoring');
app.controller('ConfigCtrl', function($scope, blocksStore, $http) {
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
    window.editor = editor;

    editor.on('change', function(){
      if(Blockly.selected){
        Blockly.selected.extra_config = editor.getValue();
      };
    });

    Blockly.mainWorkspace.getCanvas().addEventListener('blocklySelectChange', function(){

      if(Blockly.selected){
        var cfg = Blockly.selected.extra_config;
        console.log("CFG", cfg);


        if(cfg){
          editor.setValue(cfg);

        }else{
          var v = editor.getValue();
          v.remappings = [];
          editor.setValue(v);
          // editor.setValue({remappings: []});
        }
      }

    });



    // Blockly.mainWorkspace.getCanvas().addEventListener('blocklySelectChange', function(){
      // console.log('blockly selection changed');

      // if(Blockly.selected){
        // var cfg = Blockly.selected.extraConfig;
        // cfg = (cfg == 'undefined') ? null : cfg;

        // $scope.$apply(function(){
          

          // // $scope.currentBlockConfig = ((typeof cfg === 'undefined') ? '' : cfg);
        // });


      // }else{
        // $scope.$apply(function(){
          // $scope.currentBlockConfig = null;
        // });

      // }


    // });

    
    // window.config_editor.on('change', function(){
      // if(Blockly.selected){
        // Blockly.selected.extraConfig = window.config_editor.getValue();

      // };

    // });

    $scope.blockConfigChanged = function(){
      if(Blockly.selected){
        Blockly.selected.extra_config = $scope.currentBlockConfig;

      };
      console.log($scope.currentBlockConfig);


    };

});
