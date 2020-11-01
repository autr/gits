<script>
import { onMount, createEventDispatcher } from 'svelte';
import { db } from '../store-db.js'
import Tree from './Tree.svelte'
import TreeItem from './TreeItem.svelte'
const dispatch = createEventDispatcher();


export let tree;
export let arrow;
export let hidden;
export let repo;
export let root = true;
let children = [];

function onChanged( e ) {
	let v;
	const determinate = Object.keys( tree ).every( (k, i) => {
		if (i == 0) v = tree[k].file.checked;
		return ( tree[k].checked == v );
	})
	const checked = !Object.keys( tree ).every( (k, i) => !tree[k].file.checked );
	dispatch('review', {
		determinate,
		checked
	});
}

onMount(async () => {

});

export function recursiveCheck( b ) {
	for (let i = 0; i < children.length; i++) {
		children[i].recursiveCheck( b );
	}
}

let rootChecked = false;
let rootDeterminate = false;

</script>


{#if root}

	<div class="checkbox">
		<input 
			bind:checked={rootChecked} 
			type="checkbox" 
			indeterminate={!rootDeterminate} 
			 />
		<span />
	</div>
	<a 
		href="#/project/{$db.current_project}/changes/diff?repo={repo.path}&path="
		class="nounderline">
		open/close all
	</a>

{/if}
<slot />
{#each Object.keys(tree) as k, i}
	<TreeItem 
		key={k} 
		on:review
		on:changed={ onChanged }
		bind:this={ children[i] } 
		bind:value={tree[k]}
		root={false}
		{hidden}
		{repo}
		{arrow}  />
{/each}