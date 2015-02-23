var _ = require('lodash');

console.log(_);


angular.module('engine-dashboard', [
  'btford.socket-io'
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
  .controller('engineDashboardController', EngineDashboardController);



/* @ngInject */
function Config($interpolateProvider){
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');

}

/* @ngInject */
function EngineDashboardController($scope, socket, $location, $http){
  console.log(socket);

  socket.on('connect', function(){
    console.log('connected');
    socket.emit('get_processes');


  });
  $scope.foo = 'bar';


  $scope.published = [];

  socket.on('data', function(data){
    console.log(data);



    if(data.event == 'processes'){
      $scope.processes = data.payload;
    }


  });

  socket.on('publish', function(data){
    console.log('1');

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
    var workflows = prompt('workflows?');
    if(_.isEmpty(workflows)){
      return;
    }
    workflows = _(workflows.split(/,/))
      .invoke('trim')
      .value();


    if(typeof pid == 'undefined'){
      console.log('1', workflows);

      socket.emit('start', {items: workflows});
    }else{
      console.log('2', workflows);
      socket.emit('run', {pid: pid, items: workflows});
    }
  };

  $scope.killEngine = function(pid){
    socket.emit('kill', {pid: pid});
  };

}
