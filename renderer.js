var ipc = require('electron').ipcRenderer;

var audio = new Audio('assets/alarm.mp3');

var time, days;

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
	var test = moment(send.time, "HH:mm");
	if (test.isBefore(moment())) {
		test = test.add(1, 'days');
	}

	$("#time").text(test.format("dddd, MMMM Do YYYY, h:mm a"));

	time = test;
	days = send.days;
});

ipc.on('url', function(event, url) {
	$('#url').text(url);
	$('#url').attr('href', url);
});

// Start the alarm if we're past the time.
setInterval(function() {
	// Time hasn't been defined yet.
	if (typeof time === undefined) {
		return;
	}
	if (!(days instanceof Array)) {
		days = [];
	}

	if (!audio.paused) {
		return;
	}

	// If it's currently after the time, sound the alarm!
	if ( moment().isAfter(time) && days.indexOf(moment().format('dddd').toLowerCase()) > -1 ) {
		alarm();
	}
}, 1000);

function alarm() {
	audio.play();

	mySudokuJS.generateBoard("easy");
	mySudokuJS.showCandidates();

	var steps = 20;

	for (var x = 0; x<=steps; x++) {
		mySudokuJS.solveStep();
	}

	$('#sudoku').show();
}

function stop() {
	audio.pause();
	audio.currentTime = 0;

	$('#sudoku').hide();
	mySudokuJS.clearBoard();
}

