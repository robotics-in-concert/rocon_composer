
var app = angular.module('centoAuthoring');
app.controller('ConfigCtrl', function($scope, blocksStore, $http) {
    $scope.blockConfigs = {};


    Blockly.mainWorkspace.getCanvas().addEventListener('blocklySelectChange', function(){
      console.log('blockly selection changed');

      if(Blockly.selected){
        var cfg = Blockly.selected.extraConfig;
        $scope.$apply(function(){
          $scope.currentBlockConfig = cfg;
        });


      }else{
        $scope.$apply(function(){
          $scope.currentBlockConfig = null;
        });

      }


    });

    

    $scope.blockConfigChanged = function(){
      if(Blockly.selected){
        Blockly.selected.extraConfig = $scope.currentBlockConfig;

      };
      console.log($scope.currentBlockConfig);


    };

});
