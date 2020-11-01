const expandHomeDir = require('expand-home-dir')
const errors = require( './types-errors.js' );
const simpleGit = require('simple-git');


const git = {
  
  gitClients: {},

  createClientIfNot: function(project, callback) {

    project.repos.forEach( r => {
      let error = null;
      try {
        if (!git.gitClients[r.path]) {

          console.log('✅  createClientIfNot: creating new git api', r.path);
          git.gitClients[r.path] = simpleGit({
             baseDir: expandHomeDir(r.path),
             binary: 'git',
             maxConcurrentProcesses: 6,
          });
        }
      } catch (err) {
        console.error('[electron-git.js] ❌', err.message);
        error = err.message;
      }
      callback( git.gitClients[r.path], r, error );
    })
  },


  runGitMethodAll: function( gitCommand, project, args ) {

        console.log('[electron-git.js] 👋  gitRaw', project.name, cmd);
        let output = {};
        let promises = [];
        git.createClientIfNot( project, ( client, repo, error ) => {
          if (error) {
            output[repo.path] = { error };
          } else{
            promises.push(
              client[gitCommand]( args ).then( (res) => {
                output[repo.path] = res;
              }).catch( err =>{
                output[repo.path] = { error: err.message.replace(/fatal:/g, '') };
              })
            );
          }
        })
        return new Promise( (resolve, reject) => {
          Promise.all( promises ).finally( () => {
            resolve( output );
          });
        });
  },


  ipcFunctions: {

    gitStatus: function(project) {
        console.log('[electron-git.js] 👋  gitStatus', project.name);

        let output = {};
        let promises = [];
        git.createClientIfNot( project, ( client, repo, error ) => {
          if (error) {
            output[repo.path] = { error };
          } else{
            promises.push(
              new Promise ( (resolve, reject) => {
                client.status().then( (res) => {
                  output[repo.path] = res;
                  client.branchLocal().then( res => {
                    output[repo.path].localBranches = res;
                    resolve( output[repo.path].localBranches );
                  }).catch( err => {
                    output[repo.path] = { error: err.message.replace(/fatal:/g, '') };
                    reject(err.message);
                  })
                }).catch( err =>{
                  output[repo.path] = { error: err.message.replace(/fatal:/g, '') };
                  reject(err.message);
                })
              })
            );
          }
        })
        return new Promise( (resolve, reject) => {
          Promise.all( promises ).finally( () => {
            resolve( output );
          });
        });
    },

    gitDiff: function(project) {
        console.log('[electron-git.js] 👋  gitDiff', project.name);
        let output = {};
        let promises = [];
        git.createClientIfNot( project, ( client, repo, error ) => {
          if (error) {
            output[repo.path] = { error };
          } else{
            promises.push(
              client.diff().then( (res) => {
                output[repo.path] = res;
              }).catch( err =>{
                output[repo.path] = { error: err.message.replace(/fatal:/g, '') };
              })
            );
          }
        })
        return new Promise( (resolve, reject) => {
          Promise.all( promises ).finally( () => {
            resolve( output );
          });
        });
    },
    gitRaw: function(repoPath, cmd) {
        console.log('[electron-git.js] 👋  gitRaw', repoPath, cmd);

        return git.gitClients[repoPath].raw( cmd );
    }
  }
}

module.exports = git;