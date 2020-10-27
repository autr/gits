import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, set, update } = writable({
    "current_project": null,
    "current_repo": null,
    "projects": {},
    "state": 0
  });

  const current = ( id ) => {
    update( s => {
      const k = Object.keys( s.projects );
      if ( k.indexOf( id ) != -1 ) {
        s.current_project = id;
      } else {
        console.error('[store.js] no project to set as current');
      }
      return s;
    });
  }


  const add = () => {
    console.log('ADDDD');
    return promiseIpc
      .send('openDir')
      .then((dir, e) => {
        console.log('[store.js] 🔗  adding repo...', dir)
        update( s => {
          const p = s.projects[s.current_project] 
          if (p) {
            p.repos.push( dir );
          } else {
            console.error('no project to add repo to');
          }
          return s; 
        });
        save();
      })
      .catch((e) => console.error(e))
  }

  const load = () => {
    return promiseIpc
      .send('getDB')
      .then((db, e) => {
          const j = JSON.parse(db);
          console.log('[store.js] 👋  loading...');
          j.state = 1;
          set( j );
      })
      .catch((e) => console.error(e))
  }

  const save = () => {

    let store;
    update( s => store = s );
    return promiseIpc
      .send('setDB', store)
      .then((db, e) => {
        console.log('[store.js] 🗳  saving...')
        load();
      })
      .catch((e) => console.error(e))
  }


  const neu = ( name ) => {
    console.log('[store.js] 🆕 creating new project...', name)
    update( s => {
      const id = name.toLowerCase().replace(/ /g, '-');
      s.projects[id] = {
        name,
        repos: []
      }
      return s;
    });
    save();
  }

  const remove = ( key ) => {

    console.log('[store.js] ❌ deleting project...', key)
    update( s => {
      delete s.projects[key];
      save().finally( () => {
        console.log('FINALLY')
        load();
      });
      return s;
    })
  }

  return {
    subscribe,
    set,
    update,


    load,
    save,
    neu,
    current,
    add,
    remove
  };
}

export const store = createStore();