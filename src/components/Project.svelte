<script>
	import { onMount } from 'svelte';
	import { db } from '../store-db.js'
	import { git } from '../store-git.js'
	import { Router, routes, active, matches, params, query } from 'svelte-hash-router'
	import hljs from 'highlight.js'





	$: _project = () => {
		if (!$active.$$pathname) return {};
		const isProject = $active.$$pathname.substring(0, 8) == '/project';
		if ($params.id != $db.current_project && isProject) {
			console.log('[Project.svelte] ✨  updating current_project...', $params.id);
			db.setCurrentProject( $params.id );
			git.getStatuses( $db.projects[ $db.current_project ] );
			git.getDiffs( $db.projects[ $db.current_project ] );
		}
		return $db.projects[ $db.current_project ];
	}


	$: repos = project.repos;
	$: project = _project();

	function onAddRepo() {
		db.addRepo(); 
	}

</script>


{#if project}
	<div class="flex justify-between">
		<!-- <div class="highlight">{project.name}</div> -->
		<nav>
			<a class:filled={true} href="#/project/{$db.current_project}/changes">Changes</a>
			<a href="#/project/{$db.current_project}/history">History</a>
			<a href="#/project/{$db.current_project}/shared-history">Shared History</a>
			<a href="#/project/{$db.current_project}/time-machine">Time Machine</a>
		</nav>
		<aside class="">
			<button on:click={onAddRepo} >Add Repository</button>
			<!-- <button on:click={onAddRepo} >Refresh</button> -->
		</aside>
	</div>

	<Router {project} />

{/if}
