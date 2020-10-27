const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path')
const promiseIpc = require('electron-promise-ipc');
const fsp = require( 'fs-promise' );
const simpleGit = require('simple-git');

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

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
	if (mainWindow === null) createWindow();
})







promiseIpc.on('getDB', (args, e) => {
  console.log('👋  getDB')
  return fsp.readFile('./db.json', 'utf8');
});


promiseIpc.on('setDB', (args) => {
  console.log('👋  setDB')
  return fsp.writeFile('./db.json', JSON.stringify( args, null, 2 ), 'utf8');
});

promiseIpc.on('openDir', (args, e) => {
  console.log('👋  getDB')
  return new Promise( (resolve, reject) => {
    dialog.showOpenDialog(null, {
      title: 'Open a Git Repository',
      properties: ['openDirectory']
    }, (filePaths) => {
      if (filePaths <= 0) return reject();

      const dir = {
        name: path.basename( filePaths[0] ),
        path: filePaths[0]
      }

      console.log('[index.js] 📩 directory:', dir);
      return resolve( dir );
    });
  });
});

let gitClients = {};
let gitStatuses = {};
let gitDiffs = {};

const runGit = (project, callback) => {

  project.repos.forEach( r => {

    if (!gitClients[r.path]) gitClients[r.path] = simpleGit({
       baseDir: r.path,
       binary: 'git',
       maxConcurrentProcesses: 6,
    });
    callback( gitClients[r.path], r );
  })
}

promiseIpc.on('gitStatus', (project, e) => {
    console.log('👋  gitStatus', project.name);

  let o = [];
  let promises = [];
  runGit( project, ( git, repo ) => {
    console.log('>>>>', repo);

    const p = git.status().then( (res) => {
      gitStatuses[repo.path] = res;
      o.push( res );
      return res;
    }).catch( err => console.error(err) );

    promises.push(p);
  })

  return Promise.all( promises );
})

promiseIpc.on('gitDiff', (project, e) => {
    console.log('👋  gitDiff', project.name);

  let o = [];
  let promises = [];
  runGit( project, ( git, repo ) => {
    const p = git.diff().then( (res) => {
      gitDiffs[repo.path] = res;
      o.push( res );
      return res;
    }).catch( err => console.error(err) );

    promises.push(p);
  })

  return Promise.all( promises );
})

