/* jshint esversion: 6 */

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const ipc = require('electron').ipcMain;

const storage = require('node-persist');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 800, height: 600});

	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/index.html`);


	mainWindow.webContents.on('did-finish-load', function()
	{
		setInterval(function()
		{
			sendTime(mainWindow);
		}, 5000);

		sendTime(mainWindow);
	});

	// Open the DevTools.
	mainWindow.webContents.openDevTools();

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
	window.webContents.send('time', time);
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
require('./index.js');