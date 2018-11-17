/* jshint esversion: 6 */

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const powerSaveBlocker = electron.powerSaveBlocker;
const storage = require('node-persist');
const ngrok = require('ngrok');
const store = require('./assets/store');
const ip = require('quick-local-ip');

ipc.on('alarm', (_, action) => {
  let logs = store.get('logs');
  logs.push({ action, timestamp: Date.now() });
  store.set('logs', logs);
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const id = powerSaveBlocker.start('prevent-app-suspension');

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    kiosk: true,
    show: true,
  });

  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.on('did-finish-load', function()
  {
    setInterval(function()
    {
      sendTime(mainWindow);
    }, 1000);

    sendTime(mainWindow);
    startTunnel(mainWindow);
  });

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function sendTime(window) {
  var time = storage.getItem('time');
  var days = storage.getItem('days');
  var trigger = storage.getItem('trigger');
  var stop = storage.getItem('stop');
  var send = {
    time: time,
    days: days,
    trigger: trigger,
    stop: stop,
  };

  storage.setItem('trigger', false);
  storage.setItem('stop', false);
  window.webContents.send('time', send);
}

function startTunnel(window) {
  ngrok.connect({
    addr: 8081
  }, function (err, url) {
    if (err) {
      console.log('ngrok failed to start', err);
    }
    else {
      console.log('Ngrok URL: ' + url);
      console.log('Local URL: http://' + ip.getLocalIP4() + ':8081');
      window.webContents.send('url', url);
      storage.setItem('url', url);
    }
  });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
require('./index.js');
