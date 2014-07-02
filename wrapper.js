var eventEmitter = new require('events').EventEmitter();
var io = require('socket.io');

var Wrapper = function (server) {
	this.history = [];
	this.init(server);
};
var w = Wrapper.prototype;

w.init = function (server) {
	io = io.listen(server);
	io.set('log level', 2);
	var that = this;
	io.sockets.on('connection', function (socket) {that.onConnection.call(that, socket) });
};

w.onConnection = function (socket) {
	var that = this;
	socket.on('message', function (data) {that.onMessage.call(that, socket, data) });
	socket.on('disconnect', function () {that.onDisconnect.call(that, socket) });
	socket.on('setName', function (data) {that.onSetName.call(that, socket, data) });
	this.updateUsers();
	socket.emit('history', {messages: this.history});
	this.sendInfoMessage('User ' + socket.id + ' connected');
};

w.onSetName = function (socket, data) {
	if (!data.name)
		return;
	socket.userName = data.name;
	this.updateUsers();
	this.sendInfoMessage('User ' + socket.id + ' change name to ' + data.name);
};

w.onMessage = function (socket, data) {
	if (!data.text)
		return;
	this.sendMessage(socket, data.text);
};

w.onDisconnect = function (socket) {
	this.updateUsers(socket.id);
	this.sendInfoMessage('User ' + socket.id + ' disconnected');
};

w.updateUsers = function (exclude) {
	io.sockets.emit('updateUsers', {users: this.getUsers(exclude)});
};

w.saveMessage = function (message) {
	message.history = true;
	this.history.push(message);
	if (this.history.length > 10) {
		this.history.shift();
	}
};

w.getUsers = function (exclude) {
	var temp = io.sockets.manager.connected;
	if (exclude) {
		temp = JSON.parse(JSON.stringify(temp));
		delete temp[exclude];
	}
	return Object.keys(temp);
};

w.sendMessage = function (user, message, room) {
	room = room || "";
	var fullMessage = {time: new Date(), from: user.id, text: message};
	io.sockets.in(room).emit('message', fullMessage);
	this.saveMessage(fullMessage);
};

w.sendInfoMessage = function (message, room) {
	room = room || "";
	var fullMessage = {info: true, time: new Date(), text: message};
	io.sockets.in(room).emit('message', fullMessage);
	this.saveMessage(fullMessage);
};

w = null;
module.exports = function (server) { return new Wrapper(server) };