var _ = require('lodash');

console.log(_);


angular.module('engine-dashboard', [
  'btford.socket-io'
])
  .config(Config)
  .factory('socket', ['socketFactory', function(socketFactory){
    // var myIoSocket = io.connect('localhost:9999/engine');
    var myIoSocket = io(location.host + '/engine');
    myIoSocket.on('connect', function(){
      console.log('connected');
      myIoSocket.emit('get_processes');


    });

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
function EngineDashboardController($scope, socket, $location){
  console.log(socket);

  $scope.foo = 'bar';


  $scope.published = [];

  socket.on('data', function(data){
    console.log(data);



    if(data.event == 'get_processes'){
      $scope.processes = _.map(data.payload, function(pid){
        return {pid: pid};
      });

    }


  });
  socket.on('publish', function(data){
    console.log('1');

    console.log(data);
    $scope.published.push(data)

  });

}
