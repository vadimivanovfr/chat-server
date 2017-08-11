var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};
var messages = [];

var MessageType = {
    General: 0,
    PM: 1,
};

io.on('connection', function(socket){
	
	socket.on('login', function(username){
		users[socket.id] = username;
		socket.emit('login', true);
		socket.broadcast.emit('add_user', [socket.id, users[socket.id]]);
	});
	
	socket.on('disconnect', function(){
		delete users[socket.id];
		console.log('removed');
		socket.broadcast.emit('remove_user', socket.id);
	});
	  
	socket.on('message', function(type, msg, target){
		if (type == MessageType.General)
		{
			io.emit('message', [socket.id, msg, type]);
			if (messages.length > 9){
				messages.splice(0, 1);
			}
			messages.push([users[socket.id], msg]);
		}
		else
		{
			io.to(target).emit('message', [socket.id, msg, type]);
			console.log('pm to ' + users[target]);
		}
	});
	
	socket.on('load', function(){
		socket.emit('load', [users, messages]);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});