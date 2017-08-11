var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};
var messages = [];

var MessageType = { // Message types
    General: 0,
    PM: 1,
};

io.on('connection', function(socket){
	
	socket.on('login', function(username){
		users[socket.id] = username;
		socket.emit('login', true); // Sending answer to client (successful login)
		socket.broadcast.emit('add_user', [socket.id, users[socket.id]]); // Adding users to users list in client
	});
	
	socket.on('disconnect', function(){
		delete users[socket.id]; // Deleting disconnected user
		socket.broadcast.emit('remove_user', socket.id); // Removing user from users list in client
	});
	  
	socket.on('message', function(type, msg, target){ 
		if (type == MessageType.General)
		{
			io.emit('message', [socket.id, msg, type]);
			if (messages.length > 9){
				messages.splice(0, 1); // Replacing first message in the list (if list has more than 10 messages)
			}
			messages.push([users[socket.id], msg]); 
		}
		else
		{
			io.to(target).emit('message', [socket.id, msg, type]); // Sending message to the certain user
		}
	});
	
	socket.on('load', function(){
		socket.emit('load', [users, messages]); // Sending current users list and last 10 messages to the client
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
