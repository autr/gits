const {app, BrowserWindow, dialog, ipcMain, shell} = require('electron')
const path = require('path')
const promiseIpc = require('electron-promise-ipc');
const fsp = require( 'fs-promise' );
const fs = require( 'fs' );
const templates = require('./types-db.js')
const git = require('./electron-git.js')
const expandHomeDir = require('expand-home-dir')
const contextMenu = require('electron-context-menu');


const production = !process.env.ELECTRON_RELOAD;

if (!production) {
	const path = require('path');
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
		awaitWriteFinish: true,
	}); 
}

let mainWindow;

function createWindow () {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, "/preload.js")
		},
		icon: 'icon.png'
	});

	mainWindow.loadFile('public/index.html');
	mainWindow.webContents.openDevTools();

	mainWindow.on('closed', function () {
		mainWindow = null
	});
}

contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
        {
            label: 'Rainbow',
            // Only show it when right-clicking images
            visible: params.mediaType === 'image'
        },
        {
            label: 'Search Google for “{selection}”',
            // Only show it when right-clicking text
            visible: params.selectionText.trim().length > 0,
            click: () => {
                shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
            }
        }
    ]
});

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
	if (mainWindow === null) createWindow();
})



const readFileSync = ( url, template ) => {
  console.log('[electron.js] 📚  reading / writing file...', url);
  return new Promise( (resolve, reject) => {
    fs.access( url, fs.F_OK, (err) =>{
      if (err) {
        const j = JSON.stringify(template, null, 2);
        console.log('[electron.js] 🌀📚  writing template...', url, j);
        fsp.writeFile( url, j, 'utf8').then( res => {
          console.log('[electron.js] ✅📚  template successfully written...', url);
          resolve( j );
        }).catch( err => {
          console.log('[electron.js] ❌📚  error writing template...', url);
          reject(err);
        })
      } else {

        console.log('[electron.js] 🌀📚  opening existing...', url);
        fsp.readFile( url, 'utf8').then( (res) => {
          console.log('[electron.js] ✅📚  file successfully read...', url);
          resolve(res);
        }).catch( err => {
        console.log('[electron.js] ❌📚  error reading file...', url, err.message);
          reject(err);
        });
      }
    });
  }); 
}


promiseIpc.on('clearCache', (args) => {
  console.log('[electron-app.js] 👋🚚  clearCache')

  return new Promise( (resolve,reject) => {

    mainWindow.webContents.session.clearCache().finally( e => {
      mainWindow.webContents.session.clearStorageData().finally( e => {
        resolve();
      });
    })
  })
});

promiseIpc.on('getDB', args => {
  const p = path.join(__dirname, `../bin/db.json`);
  console.log('[electron-app.js] 👋🚚  getDB', p)
  return readFileSync( p, templates.db );
});


promiseIpc.on('setDB', (args) => {
  const p = path.join(__dirname, `../bin/db.json`);
  const j =  JSON.stringify( args, null, 2 );
  console.log('[electron-app.js] 👋🚚  setDB', p)
  return fsp.writeFile(p, j, 'utf8');
});


promiseIpc.on('openDir', (args, e) => {
  console.log('[electron-app.js] 👋🗄  openDir')
  return new Promise( (resolve, reject) => {
    const r = dialog.showOpenDialog({
      title: 'Open a Git Repository',
      properties: ['openDirectory']
    }).then( res => {
      if (res.filePaths.length <= 0) {
        console.log('[electron-app.js] 🚪🗄  openDir no filepaths...')
        return reject();
      }

      // save as ~/ home dir, so can work across multiple machines...

      let url = res.filePaths[0];
      let user = expandHomeDir('~');
      let relative = path.relative(user, url);

      console.log('[electron-app.js] ✅🗄  openDir success:')

      const dir = {
        name: path.basename( url ),
        path: '~/'+relative
      }
      return resolve( dir );
    }).catch( err =>{

      console.log('[electron-app.js] ❌🗄  openDir fail...', err.message)
      reject(err.message);
    });
  });
});


promiseIpc.on('openEditor', (path, e) => {
  shell.openPath(`${path}`)
});

// bind git functions

console.log('[electron-app.js] 🐈🐙  binding git IPC functions...');
const keys = Object.keys(git.ipcFunctions);
for (let i = 0; i < keys.length; i++) {
  const k = keys[i];
  promiseIpc.on(k, git.ipcFunctions[k]);
  console.log('[electron-app.js] 🐈🐙  bound IPC function...', k);
}
