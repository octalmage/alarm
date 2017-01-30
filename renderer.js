var ipc = require('electron').ipcRenderer;
var audio = new Audio('assets/alarm.mp3');
var CronJob = require('cron').CronJob;
var time, days, oldTime, job;

var mySudokuJS = $("#sudoku").sudokuJS({
	boardFinishedFn: function(data){
		stop();
	}
});

// Loop
audio.addEventListener('ended', function() {
	this.currentTime = 0;
	this.play();
}, false);


ipc.on('time', function(event, send) {
	if ( send.trigger ) {
		alarm();
	}
	var test = moment(send.time, "HH:mm");

	if (time == send.time && days.join() == send.days.join()) {
		return;
	}

	job = new CronJob({
		cronTime: convertDate(send.time, send.days),
		onTick: alarm,
		start: true,
		timeZone: 'America/Chicago'
	});

	days = send.days;
	time = send.time;

	$("#time").text(test.format("dddd, MMMM Do YYYY, h:mm a"));
});

ipc.on('url', function(event, url) {
	$('#url').text(url);
});

function alarm() {
	audio.volume = 1;
	audio.play();

	mySudokuJS.generateBoard("easy");
	mySudokuJS.showCandidates();

	var steps = 10;

	for (var x = 0; x<=steps; x++) {
		mySudokuJS.solveStep();
	}

	$('body').css('background-color', '#fff');
	$('body').css('color', '#000');

	$('#sudoku').show();
}

function stop() {
	audio.pause();
	audio.currentTime = 0;

	$('body').css('background-color', '#000');
	$('body').css('color', '#fff');

	$('#sudoku').hide();
	mySudokuJS.clearBoard();
}

function convertDate(time, days) {
  var conversion = {
  	'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
  }
  var split = time.split(':');
  var hours = split[0];
  var minutes = split[1];
  var dayMap = days.map(function(d) {
  	return conversion[d];
  });

  return minutes + ' ' + hours + ' * * ' + dayMap.join(',');
}

var turndown = function() {
	audio.volume = 0.01;
};

$(document).on('click', function() {
	turndown();
});

$(document).on('keypress', turndown);

$(document).on('mousemove', turndown);
