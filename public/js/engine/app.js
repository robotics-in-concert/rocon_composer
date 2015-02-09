angular.module('engine-dashboard', [
  'btford.socket-io'
])
  .config(Config)
  .factory('socket', ['socketFactory', function(socketFactory){
    var host = location.host;
    var sock_port = SOCKETIO_PORT;
    
    if(host.match(/:\d+/)){
      host = host.replace(location.port, sock_port);
    }else{
      host = host + ":" + sock_port;
    }
    var url = location.protocol + '//' + host + "/engine";
    console.log('socket host', url);

    var myIoSocket = io.connect(url);

    var sock = socketFactory({
      ioSocket: myIoSocket,
      prefix: 'engine:'
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
  $scope.foo = 'bar';


  $scope.published = [];

  socket.on('publish', function(data){
    console.log('1');

    console.log(data);
    $scope.published.push(data)

  });

}
