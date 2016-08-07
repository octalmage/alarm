var express = require('express');
var app = express();
var storage = require('node-persist');
//var mustacheExpress = require('mustache-express');
var hbs = require('hbs');
app.use(express.static('assets/public'));

// Register '.mustache' extension with The Mustache Express
app.engine('html', hbs.__express);
// check helper
hbs.registerHelper("checked", function( array, value, options ){
	return (array.indexOf(value) > -1) ? 'checked="checked"' : '';
});

app.set('view engine', 'html');
app.set('views', __dirname + "/assets/views/");
storage.initSync();

app.use(express.static('public'));

app.get('/', function (req, res) {
	var time = storage.getItem('time');
	var days = storage.getItem('days');
res.render('index', { time: time, days: days });
});


app.get('/save', function (req, res) {

	// Prepare output in JSON format
	storage.setItem('time',req.query.usr_time);
	storage.setItem('days',req.query.days);
	res.redirect('/');
});

app.get('/get', function (req, res) {

	// gets time

	var time = storage.getItem('time');
	res.end(JSON.stringify(time));
});

var server = app.listen(8081, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log("Example app listening at http://%s:%s", host, port);

});