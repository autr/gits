import { writable } from 'svelte/store';
import templates from './types-db.js'

function createStore() {
  const { subscribe, set, update } = writable( templates.git );

  const getStatuses = ( project ) => {

    console.log('[store-git.js] 🌀  getting git status...', project);
    return promiseIpc
      .send('gitStatus', project)
      .then((res, e) => {
        update( store => {
          store.statuses[project.name] = res;
          const projectStatuses = store.statuses[project.name];

          const flags = ['conflicted', 'created', 'deleted', 'modified', 'not_added', 'renamed', 'staged'];
          const keys = Object.keys(projectStatuses);

          for (let i = 0; i < keys.length; i++) {

            const repoName = keys[i]; // repo repoName

            let repoStatus = projectStatuses[repoName]; // repo status
            repoStatus.tree = {}; // create tree

            repoStatus.files.forEach(file => {
              let obj = repoStatus.tree;
              const split = file.path.split('/');
              let path = '';
              split.forEach( (p, i) => {
                const last = i == split.length - 1;
                path += p;
                if (!obj[p]) {
                  obj[p] = { file: { path }, children: {} }
                  if (last) {
                    obj[p].file = file
                    for (let ii = 0; ii < flags.length; ii++ ) {
                      const flag = flags[ii];
                      const list = repoStatus[ flag ];
                      if (list.indexOf(file.path) != -1) obj[p].file.flag = flag;
                    }
                  }
                }
                obj = obj[p].children;
              })
            }); 

          }
          console.log('[store-git.js] ✅🌀  got git statuses:\n[store-git.js]', projectStatuses);
          return store;

        })

      }).catch((err) => {
        console.log('[store-git.js] ❌🌀  error getting statuses:', err.message);
      })
  }

  const getDiffs = ( project ) => {

      console.log('[store-git.js] 🌀  getting git diffs...', project);
      return promiseIpc
        .send('gitDiff', project )
        .then((res, e) => {

          update( store => {
            console.log('[store-git.js] ✅🌀  got git diffs:\n[store-git.js]', res);
            store.diffs[project.name] = res;
            return store;
          });
        })
        .catch((err) => {
          console.log('[store-git.js] ❌🌀  error getting diffs:', err.message);
        })
  }
  const getRaw = ( project, cmd ) => {

      console.log('[store-git.js] 🌀  getting git raw...', project, cmd);
      return promiseIpc
        .send('gitRaw', project, cmd )
        .catch((err) => {
          console.log('[store-git.js] ❌🌀  error getting raw:', err.message);
        })
  }


  return {
    subscribe,
    set,
    update,
    getStatuses,
    getDiffs,
    getRaw
  };
}

export const git = createStore();