var R = require('ramda');

module.exports = function($scope, blocksStore) {
  $scope.items = [];
  $scope.recents = [];
  blocksStore.getParam(ITEMS_PARAM_KEY).then(function(rows){
    console.log('loaded ', rows);
    if(!rows){
      $scope.items = $scope.recents = [];
    }else{
      $scope.items = rows;
      $scope.recents = R.take(5, R.sort(function(a, b){ return b.id - a.id; }, rows));
    }
  });
};
