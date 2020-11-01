import { writable } from 'svelte/store';
import templates from './types-db.js'

function createStore() {
  const { subscribe, set, update } = writable( templates.db );

  const setCurrentDiff = ( arr ) => {
    update( s => {
      console.log('[store-db.js] ☯️ setting current diff to:\n[store-db.js]', arr )
      s.current_diff = arr;
      return s
    })
  }

  const setCurrentProject = ( id ) => {
    update( s => {
      const k = Object.keys( s.projects );
      if ( k.indexOf( id ) != -1 ) {
        console.log('[store-db.js] 💾 current project set to:\n[store-db.js]', id)
        s.current_project = id;
      } else {
        console.log('[store-db.js] ❌  no project to set as current, setting to null');
        s.current_project = null;
      }
      return s;
    });
  }


  const addRepo = () => {
    return new Promise( (resolve, reject) => {

      promiseIpc
        .send('openDir')
        .then((dir, e) => {
          console.log('[store-db.js] 🔗  adding repo...', dir)
          update( s => {
            const p = s.projects[s.current_project] 
            if (p) {
              console.log('[store-db.js] ✅🔗  repo added:\n[store-db.js]', dir)
              p.repos.push( dir );
              return saveLoad();
            } else {
              console.log('[store-db.js] ❌🔗  no project to add repo to...')
              reject('no project to add repo to')
            }
            return s; 
          });
        })
      .catch((err) => {
        console.log('[store-db.js] ❌🔗  error adding repo...', err.message)
        reject(err.message);
      })
    })
  }

  const load = () => {
    console.log('[store-db.js] 💾 loading database...')
    return promiseIpc
      .send('getDB')
      .then((db, e) => {
          const j = JSON.parse(db);
          console.log('[store-db.js] ✅💾 loaded db:\n[store-db.js]', j)
          j.state = 1;
          set( j );
      })
      .catch((err) => {
        console.log('[store-db.js] ❌💾 error loading db:\n[store-db.js]', err.message)
      })
  }

  const save = () => {

    console.log('[store-db.js] 💾 saving database...')
    let store;
    update( s => store = s );
    return promiseIpc
      .send('setDB', store)
      .then((db, e) => {
        console.log('[store-db.js] ✅💾 saved db:\n[store-db.js]', db)
        load();
      })
      .catch((err) => {
        console.log('[store-db.js] ❌💾 error saving db:', err.message)
      })
  }


  const neuProject = ( name ) => {
    console.log('[store-db.js] 🆕 creating new project...', name)
    update( s => {
      const id = name.toLowerCase().replace(/ /g, '-');
      s.projects[id] = templates.project;
      s.projects[id].name = id;
      return s;
    });
    save();
  }

  const removeProject = ( key ) => {

    console.log('[store-db.js] 🛑 deleting project...', key)
    update( s => {
      if (s.current_project == key) s.current_project = null;
      delete s.projects[key];
      return s;
    })
    return saveLoad();
  }
  const removeRepo = ( repo ) => {

    console.log('[store-db.js] 🛑 deleting repo...', JSON.stringify(repo, null, 2))
    update( s => {

      const p = s.projects[s.current_project];
      if (p) {
        for(let i = 0; i < p.repos.length; i++ ){
          const r = p.repos[i];
          if (r.path == repo.path && r.name == repo.name) {
            p.repos.splice(i,1);
            console.log('[store-db.js] ✅🛑 deleted repo:', JSON.stringify(p.repos, null, 2))
          }
        }
      }
      return s;
    })
    return saveLoad();
  }

  const saveLoad = () => {
    return new Promise( (resolve, reject) => {

      save().then( () => {
        load().then( () => {
          setTimeout( resolve, 200);
        }).catch( err => {
          reject( err );
        })
      }).catch( err => {
        reject( err );
      });
    });
  }
  return {
    subscribe,
    set,
    update,


    load,
    save,
    neuProject,
    setCurrentProject,
    addRepo,
    removeProject,
    removeRepo,
    setCurrentDiff
  };
}

export const db = createStore();