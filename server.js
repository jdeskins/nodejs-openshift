var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
 

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  
  //Handle 'message' messages
  socket.on('message', function (message) {
      log('S --> got message: ', message);
      // channel-only broadcast...
      //socket.broadcast.to(message.channel).emit('message', message);
      io.to(message.channel).emit('message', message);
  });
  
  // Handle 'message' messages
  socket.on('display', function (message) {
      log('S --> got display: ', message);
      // channel-only broadcast...
      //socket.broadcast.to(message.channel).emit('message', message);
      io.to(message.channel).emit('display', message);
  });
  
  // Handle 'message' messages
  socket.on('command', function (message) {
	  log('S --> got command: ', message);
	  // channel-only broadcast...
	  //socket.broadcast.to(message.channel).emit('message', message);
	  io.to(message.channel).emit('command', message);
  });
  
  //Handle 'create or join' messages
  socket.on('create or join', function (room) {
    	var clients = io.sockets.adapter.rooms[room];  
		if (typeof clients !== 'undefined') {
			console.log('Object.keys(clients) = ' + Object.keys(clients));
		}
		var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
		console.log('numclients = ' + numClients);

      log('S --> Room ' + room + ' has ' + numClients + ' client(s)');
      log('S --> Request to create or join room', room);

      // First client joining...
      if (numClients == 0){
              socket.join(room);
              socket.emit('created', room);
      } else if (numClients == 1) {
      // Second client joining...                	
              io.sockets.to(room).emit('join', room);	//was io.sockets.in(room).emit('join', room);
              socket.join(room);
              socket.emit('joined', room);
      } else { // max two clients
              socket.emit('full', room);
      }
  });
  
  socket.on('leave', function (room) {
	  io.to(room).emit('message', 'Scanner disconnected');
	  socket.leave(room);
	  log('S --> Request to leave room', room);
});
  
  function log(){
      var array = [">>> "];
      for (var i = 0; i < arguments.length; i++) {
      	array.push(arguments[i]);
      }
      socket.emit('log', array);
  }
  
});


//http.listen(app.get('port'), app.get('ipaddr'), function(){
//	console.log('Express server listening on  IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
//});

http.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});
