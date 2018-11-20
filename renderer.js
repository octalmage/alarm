var ipc = require('electron').ipcRenderer;
var audio = new Audio('assets/alarm.mp3');
var CronJob = require('cron').CronJob;
var time, days, oldTime, job, timeout;

var mySudokuJS = $("#sudoku").sudokuJS({
  boardFinishedFn: function() {
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

  if ( send.stop ) {
    stop();
  }
  var test = moment(send.time, "HH:mm");

  if (time == send.time && days.join() == send.days.join()) {
    return;
  }

  // Stop the already scheduled job.
  if (typeof job !== 'undefined' && typeof job.running !== 'undefined') {
    job.stop();
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
  ipc.send('alarm', 'play');

  audio.volume = 1;
  audio.play();

  mySudokuJS.generateBoard("easy");
  mySudokuJS.showCandidates();

  var steps = 31;

  for (var x = 0; x<=steps; x++) {
    mySudokuJS.solveStep();
  }

  $('body').css('background-color', '#fff');
  $('body').css('color', '#000');

  $('#sudoku').show();

  // Timeout after an hour.
  timeout = setTimeout(stop, 3600000);
}

function stop() {
  ipc.send('alarm', 'stop');
  clearTimeout(timeout);
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
  };

  var split = time.split(':');
  var hours = split[0];
  var minutes = split[1];
  var dayMap = days.map(function(d) {
    return conversion[d];
  });

  return minutes + ' ' + hours + ' * * ' + dayMap.join(',');
}

var turndown = function() {
  if (!audio.paused && audio.volume > 0) {
    ipc.send('alarm', 'turndown');
  }
  audio.volume = 0.05;
};

$(document).on('click', turndown);
$(document).on('keypress', turndown);
