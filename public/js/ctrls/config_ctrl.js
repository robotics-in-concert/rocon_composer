
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
          }
        }
      }
      
    });
    window.editor = editor;

    editor.on('change', function(){
      if(Blockly.selected){
        Blockly.selected.extraConfig = JSON.stringify(editor.getValue());
      };
    });

    Blockly.mainWorkspace.getCanvas().addEventListener('blocklySelectChange', function(){

      if(Blockly.selected){
        var cfg = Blockly.selected.extraConfig;
        console.log(cfg);


        if(!cfg || cfg == 'undefined' || cfg == null){
          editor.setValue({remappings: []});
        }else{
          editor.setValue(JSON.parse(cfg));
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
        Blockly.selected.extraConfig = $scope.currentBlockConfig;

      };
      console.log($scope.currentBlockConfig);


    };

});
