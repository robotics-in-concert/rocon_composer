module.exports = function(io){
  io.on('connection', function(socket){
    console.log('socket connected');

    socket.on('disconnect', function(){
      console.log('socket disconnected');
    });
    socket.on('blockly:workspace:lock', function(e){
      socket.host = true;
      socket.emit('blockly:workspace:locked');
    });
    socket.on('blockly:workspace:changed', function(e){
      if(socket.host && socket.channel){
        socket.broadcast.to(socket.channel).emit('blockly:workspace:changed', e);
      }
    });
    socket.on('blockly:channel:create', function(e){
      socket.host = true;
      socket.channel = e.name;
      socket.join(e.name);
      return 'created';

    });
    socket.on('blockly:channel:join', function(e){
      socket.host = false;
      socket.channel = e.name;
      socket.join(e.name);
    });
    socket.on('blockly:channel:leave', function(e){
      socket.host = false;
      socket.leave(socket.channel);
      socket.channel = null;
    });




  });

};
