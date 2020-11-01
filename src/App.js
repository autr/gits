import App from './App.svelte';
import { routes } from 'svelte-hash-router'

import About from './components/About.svelte';
import Overview from './components/Overview.svelte';
import Project from './components/Project.svelte';
import Repo from './components/Repo.svelte';
import Changes from './components/Changes.svelte';
import History from './components/History.svelte';
import Diff from './components/Diff.svelte';

routes.set( {
  '/about': About,
  '/': Overview,
  '/project/:id': {
  	$$component: Project,
  	'/changes': {
  		$$component: Changes,
  		'/diff': Diff
  	},
  	'/history': History
  }
});

const app = new App({
	target: document.body,
	props: {}
});

export default app;
