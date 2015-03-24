var _ = require('lodash');

module.exports = function($scope, blocksStore, $http, $state, $rootScope) {

  angular.element(document).on('unload', function(e){
    console.log('unload');
    e.preventDefault();


  });


  $scope.services = [];
  $scope.state = $state;


  console.log('00000000000000');

  blocksStore.loadRapp().then(function(data){

    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXX', data);

    $rootScope.rapps = data;
  console.log('9999999999');

  });

  blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.items = [];
    }else{
      $scope.items = rows;
      $rootScope.$emit('items:loaded');
      // reload_udf_blocks($scope.items);

    }

    $scope.$watch('items', function(newValue, oldValue) {
      console.log('items watched');
      if (!_.isEqual(newValue, oldValue)) {
        console.log(oldValue, "->", newValue);

        blocksStore.setParam(ITEMS_PARAM_KEY, newValue).then(function(res){
          $rootScope.$emit('items:saved');

        });
          
      }
    }, true);

  });

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

};
