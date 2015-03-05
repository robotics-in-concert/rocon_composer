(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/eskim/current/cento_authoring/public/js/ctrls/items_select_ctrl.js":[function(require,module,exports){
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

},{}],"/Users/eskim/current/cento_authoring/public/js/engine/app.js":[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var ItemsSelectCtrl = require('../ctrls/items_select_ctrl');

angular.module('engine-dashboard', [
  'btford.socket-io',
  'ui.bootstrap',
  'ui.router'
])
  .config(Config)
  .factory('socket', ['socketFactory', function(socketFactory){
    // var myIoSocket = io.connect('localhost:9999/engine');
    var myIoSocket = io(location.host + '/engine/client');

    var sock = socketFactory({
      ioSocket: myIoSocket
    });
    sock.forward('error');
    return sock;
  }])
  .controller('dashboardRootController', DashboardRootController)
  .controller('dashboardResourcesController', DashboardResourcesController)
  .controller('engineDashboardController', EngineDashboardController);



/* @ngInject */
function Config($interpolateProvider, $stateProvider, $urlRouterProvider){
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');

  $urlRouterProvider.otherwise('/index');

  $stateProvider
    .state('index', {
      url: '/index',
      templateUrl: '/js/tpl/dashboard_index.html',
      controller: 'engineDashboardController'

    })
    .state('resources', {
      url: '/resources',
      templateUrl: '/js/tpl/dashboard_resources.html',
      controller: 'dashboardResourcesController'

    })

}
/* @ngInject */
function DashboardRootController($scope, socket, $location, $http, $modal){
  socket.on('connect', function(){
    console.log('connected');
    socket.emit('get_resources');
    socket.emit('get_processes');
  });


  socket.on('data', function(data){

    switch(data.event){
      case 'resource_pool':
        if(data.payload.resources)
          $scope.pool  = data.payload.resources;
        break;

      case 'processes':
        $scope.processes = data.payload;
        break;
      case 'resources':
        $scope.resources = data.payload;
        break;

    }
           
  });

};

/* @ngInject */
function DashboardResourcesController($scope, socket, $location, $http, $modal){

};




/* @ngInject */
function EngineDashboardController($scope, socket, $location, $http, $modal){

  socket.on('connect', function(){
  });

  $scope.published = [];

  socket.on('publish', function(data){

    console.log(data);
    $scope.published.push(data)

  });




  $scope.start = function(pid){
    socket.emit('start', {items: null});
  };

  $scope.killEngine = function(pid){
    socket.emit('kill', {pid: pid});
  };
  $scope.run = function(pid){

    var $mi = $modal.open({
      templateUrl: '/js/tpl/modal_items_select.html',
      controller: ItemsSelectCtrl,
      controllerAs: 'ctrl',
      resolve: {
        items: function(){
          return $http.get('/api/param/cento_authoring_items').then(function(res){
            if(res.data.data){
              return _.map(res.data.data, 'title');
            }
            return null;
          });

        }
      }

    });
    $mi.result.then(function(workflows){
      if(typeof pid == 'undefined'){
        console.log('1', workflows);

        socket.emit('start', {items: workflows});
      }else{
        console.log('2', workflows);
        socket.emit('run', {pid: pid, items: workflows});
      }

    });


  };

  $scope.killEngine = function(pid){
    socket.emit('kill', {pid: pid});
  };
  $scope.releaseResource = function(rid){
    socket.emit('release_resource', {requester: rid});
  };

}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../ctrls/items_select_ctrl":"/Users/eskim/current/cento_authoring/public/js/ctrls/items_select_ctrl.js"}]},{},["/Users/eskim/current/cento_authoring/public/js/engine/app.js"]);
