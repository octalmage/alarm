var ipc = require('electron').ipcRenderer;

var audio = new Audio('assets/alarm.mp3');

var time;

// Loop
audio.addEventListener('ended', function() {
	this.currentTime = 0;
	this.play();
}, false);


ipc.on('time', function(event, newTime) {
	var test = moment(newTime, "HH:mm");
	if (test.isBefore(moment())) {
		test = test.add(1, 'days');
	}
	$("#time").text(test.format("dddd, MMMM Do YYYY, h:mm a"));

	time = test;
});

// Start the alarm if we're past the time.
setInterval(function() {
	// Time hasn't been defined yet.
	if (typeof time === undefined) {
		return;
	}

	// If it's currently after the time, sound the alarm!
	if ( moment().isAfter(time) ) {
		alarm();
	}
}, 1000);

function alarm() {
	audio.play();
}

function stop() {
	audio.pause();
	audio.currentTime = 0;
}

