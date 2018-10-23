// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
const path = require('path')
const url = require('url')
const config = require('./config')
const isDev = require('electron-is-dev');
const windowStateKeeper = require('electron-window-state');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
console.log("config",config.setData())
let mainWindow
function createWindow() {
  // Create the browser window.
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 750
  });
  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    icon: path.join(__dirname, 'icons/mac/wandx_logo.icns'),
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'assets/preload.js')
    }
  })
  mainWindowState.manage(mainWindow);
  if (isDev) {
    mainWindow.loadURL('http://localhost:4200')
  } else {
    mainWindow.loadURL('http://18.220.128.38:4200')
  }
  // mainWindow.openDevTools()
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  // Create the Application's main menu
  var template = [{
    label: "Application",
    submenu: [
      {type: "separator"},
      {
        label: "Quit", accelerator: "Command+Q", click: function () {
          app.quit();
        }
      }
    ]
  }, {
    label: "Edit",
    submenu: [
      {label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
      {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
      {type: "separator"},
      {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
      {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
      {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
      {label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
    ]
  },
    {
      label: 'View',
      submenu: [
        {role: 'reload'}
      ]
    }, {
      label: 'Developer',
      submenu: [
        {role: 'toggledevtools'}
      ]
    }
  ];
  if (isDev) {
    template.push({
      label: 'Developer',
      submenu: [
        {role: 'toggledevtools'}
      ]
    })
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
