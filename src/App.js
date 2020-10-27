import App from './App.svelte';
import { routes } from 'svelte-hash-router'

import About from './components/About.svelte';
import Overview from './components/Overview.svelte';
import Project from './components/Project.svelte';
import Repo from './components/Repo.svelte';

routes.set( {
  '/about': About,
  '/': Overview,
  '/project/:id': Project,
  '/project/:id/diff': Project
});

const app = new App({
	target: document.body,
	props: {}
});

export default app;
