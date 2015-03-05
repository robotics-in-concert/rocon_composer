var _ = require('lodash');
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
  .directive('resourceStatusLabel', resourceStatusLabel)
  .controller('dashboardRootController', DashboardRootController)
  .controller('dashboardResourcesController', DashboardResourcesController)
  .controller('engineDashboardController', EngineDashboardController);


/* @ngInject */
function resourceStatusLabel(){
  return {
    restrict: 'E',
    replace: true,
    template: '<span class="label [[cls]]">[[label]]</span>',
    scope: {
      status: '@'
    },
    link: function(scope, elem, attrs){
      console.log(attrs);

      var tbl = {
        0: 'NEW',
        1: 'RESERVED',
        2: 'WAITING',
        3: 'GRANTED',
        4: 'PREEMPTING',
        5: 'CANCELING',
        6: 'CLOSED'
      }
     
      scope.cls = 'label-default';
      scope.label = tbl[+attrs.status];

      if(+attrs.status == 3){
        scope.cls = 'label-success';
      }
    }

  }

}

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
