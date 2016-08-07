var express = require('express');
var app = express();
var storage = require('node-persist');
var mustacheExpress = require('mustache-express');

// Register '.mustache' extension with The Mustache Express
app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views',__dirname + "/assets/views/")
storage.initSync();

app.use(express.static('public'));

app.get('/', function (req, res) {
	var time = storage.getItem('time');
	console.log(time);
res.render('index', { time: time});
});


app.get('/save', function (req, res) {

	// Prepare output in JSON format
	response = {
		time:req.query.usr_time,
	};
	storage.setItem('time',req.query.usr_time);
	res.end(JSON.stringify(response));
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