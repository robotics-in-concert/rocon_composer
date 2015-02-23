// @ngInject
function ItemsSelectCtrl($scope, $rootScope, $modalInstance, items) {

  var ctrl = this;
  ctrl.items = items;
  ctrl.selected = null;

  this.ok = function(){
    $modalInstance.close(ctrl.selected);
  };


};

module.exports = ItemsSelectCtrl;
