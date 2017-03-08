const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  win.setMenu(null);

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })


  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

  const fs = require('fs');

  const logFolder = '/home/pcnate/Documents/EVE/logs/Chatlogs/';

  var channels = ['The Drone Den'];

  var newestFiles = {};

  function getNewestFile1( channel, files ) {
    var path = logFolder;
    var out = [];
    files.forEach(function(file) {
      var stats = fs.statSync(path + "/" +file);
      if(stats.isFile()) {
        out.push({"file":file, "mtime": stats.mtime.getTime()});
      }
    });
    out.sort(function(a,b) {
      return b.mtime - a.mtime;
    })
    return (out.length>0) ? out[0].file : "";
  }

  /**
   * @description process the selected file for the selected channel
   */
  function processFile( channel, file ) {
    file = logFolder + file;

    fs.readFile( file, 'utf8', ( err, contents ) => {
      if( !err ) {
        // console.log( contents );

        // log.info(contents);
      }
    });

  }


  readFiles = function() {
    // var t = getNewestFile2( logFolder, new RegExp( channel + '.*\.txt' ) )
    // console.log( t );
    fs.readdir(logFolder, function(err, f) {
      var files = [];
      channels.forEach(function( channel ) {

        var channelFiles = [];

        f.forEach(function( file ) {

          if( file.includes( channel ) ) {
            channelFiles.push( file );
          }

        })

        processFile( channel, getNewestFile1( channel, channelFiles ) );

        // channelFiles.sort();
        //
        // newestFiles[channel] = channelFiles[channelFiles.length-1];

      })
      // var t = getNewestFile1( files, logFolder );
      // console.log( t );
    });

  }

  setInterval( function() {
    readFiles();
  }, 5000 )


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
