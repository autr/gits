<script>
	import { onMount } from 'svelte';
	import Repo from './Repo.svelte'
	import { db } from '../store-db.js'
	import { git } from '../store-git.js'
	import { Router, query } from 'svelte-hash-router'
	export let project = {};
	export let diff;


	onMount(async () => {
		console.log('[Changes.svelte] 🌲🌲 mounting...', JSON.stringify(project, null, 2));
		git.getStatuses( project );
		// git.getDiffs( project );
	});



	$: statuses = $git.statuses[project.name] || {};
	$: status = repo => statuses[repo.path];
	$: repos = project.repos || [];

</script>

{#if project}
	<div class="grid">

		<!-- repos loop -->

		<div class="col repos">
			{#each repos as repo, i }
				<Repo {repo} status={status(repo)} {project} />
			{/each}
		</div>

		<!-- diff viewer -->

		<div class="col diff">
			<Router />
		</div>

	</div>
{/if}