
var app = angular.module('centoAuthoring');
app.controller('RootCtrl', function($scope, blocksStore, $http, $state) {

  angular.element(document).on('unload', function(e){
    console.log('unload');
    e.preventDefault();


  });


  $scope.services = [];
  $scope.state = $state;

  blocksStore.getParam(SERVICES_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.services = $scope.recents = [];
    }else{
      $scope.services = rows;
      // $scope.recents = R.take(5, R.sort(function(a, b){ return b.id - a.id; }, rows));
    }
    $scope.$watch('services', function(newValue, oldValue) {
      console.log('services watched');
      if (!_.isEqual(newValue, oldValue)) {
        console.log(oldValue, "->", newValue);

        blocksStore.setParam(SERVICES_PARAM_KEY, newValue).then(function(res){
          console.log('services saved', newValue, res);

        });
          
      }
    }, true);
  });

  $scope.searchCompare = function(v, keyword){ 
    return v.toString().toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
  };

});
