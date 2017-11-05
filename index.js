var express = require('express');
var app = express();
var storage = require('node-persist');
//var mustacheExpress = require('mustache-express');
var hbs = require('hbs');
app.use(express.static('assets/public'));

// Redirect on on save/trigger.
app.use(/\/(?:save|trigger)/i, function (req, res, next) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<html><body><script>window.location.href = "/";</script></body></html>');
	res.end();
	next();
});

// Register '.mustache' extension with The Mustache Express
app.engine('html', hbs.__express);
// check helper
hbs.registerHelper('checked', function( array, value, options ) {
	array = ( array instanceof Array ) ? array : [array];
	return (array.indexOf(value) > -1) ? 'checked="checked"' : '';
});

app.set('view engine', 'html');
app.set('views', __dirname + "/assets/views/");
storage.initSync();

app.use(express.static('public'));

app.get('/', function (req, res) {
	var time = storage.getItem('time');
	var days = storage.getItem('days');
	var url = storage.getItem('url');
	res.render('index', { time: time, days: days, url: url });
});

app.get('/save', function (req, res) {
	// Prepare output in JSON format
	storage.setItem('time',req.query.usr_time);
	storage.setItem('days',req.query.days);
	res.end();
});

app.get('/trigger', function (req, res) {
	// Set the alarm trigger.
	storage.setItem('trigger', true);
	res.end();
});

app.get('/get', function (req, res) {
	// gets time
	var time = storage.getItem('time');
	res.end(JSON.stringify(time));
});

var server = app.listen(8081, function () {
	var port = server.address().port;
	console.log('Server started on port ' + port);
});
