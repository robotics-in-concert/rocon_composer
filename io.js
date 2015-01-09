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
      if(socket.host)
        socket.broadcast.emit('blockly:workspace:changed', e);
    });



  });

};
