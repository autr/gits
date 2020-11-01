<script>

	import { onMount } from 'svelte';
	import { db } from '../store-db.js'
	import Tree from './Tree.svelte'
	import treeify from './../treeify.js'
	export let repo;
	export let status;
	export let project;


	const emojis = {
		'conflicted': '⚔️',
		'created': '✨',
		'deleted': '❌',
		'modified': '✏️',
		'not_added': '✨',
		'renamed': '✍️',
		'staged': '✅'
	}

	const types = ['conflicted', 'created', 'deleted', 'modified', 'not_added', 'renamed', 'staged'];

	function getTag( status, path ) {
		for (let i = 0; i < types.length; i++ ) {
			const t = types[i];
			const l = status[ t ];
			if (l.indexOf(path) != -1) return t;
		}
	}

	function onOpenEditor( path ) {

		promiseIpc
			.send('openEditor', path)
			.then((res, e) => {
				console.log(res);
			})
			.catch((e) => console.error(e))
	}

	function onRemove() {
		db.removeRepo( repo );
	}

</script>

<style>

</style>

{#if repo && status }
	<div class="repo">
		<!-- <div class="fade">--------------------------------------------------------------------------------------------</div> -->

		<!-- titles -->

		<header class="flex justify-between">
			<div class="title">
				<span class="highlight">{ repo.name} </span>
		        <span class="alert" on:click={onRemove}>✖</span>
			</div>

			<!-- path -->

			<div class="fade" on:click={ e => onOpenEditor(repo.path) }>{repo.path}</div>
		</header>
		<aside class="flex justify-between">

			<!-- status -->

			{#if status.error}
				<div>{status.error}</div>
			{:else}
				<div class="branch">

						<div class="select">
							<select 
								style="width: { (status.current.length * 5) + 20 }px"
								bind:value={status.current}>
								{#each status.localBranches.all as branch}
									<option>{branch}</option>
								{/each}
								{#if status.localBranches.all.length == 0}
									<option>{status.current}</option>
								{/if}
								<option value="create-new-branch">create new...</option>
							</select>
						</div>
					<!-- {@html status.tracking || 'none' } -->
				</div>
				<div 
					class="status"
					class:alert={status.behind > 0 } 
					class:ok={status.behind == 0 && status.ahead == 0}
					title={`${status.ahead} ahead, ${status.behind} behind`}
					>
					{status.ahead} ahead, {status.behind} behind
				</div>

				<!-- files -->

			{/if}

		</aside>
		<section class="changes">

			<Tree bind:tree={status.tree} {repo}>

			</Tree>

		</section>



	</div>

{/if}