var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var stylus = require('stylus');
var jade = require('jade');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(app.router);
app.use(stylus.middleware({
	src: 'views',
	dest: 'public'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	fs.readFile(__dirname + '/public/index.html', function (err, data) {
		res.end(data);
	});
});

jade.renderFile(__dirname + '/views/index.jade', {pretty: true}, function (err, html) {
	if (!err) {
		fs.writeFileSync(__dirname + '/public/index.html', html);
		console.log('index.html created');
	}
});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

var netwrapper = require('./wrapper.js')(server);