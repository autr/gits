<script>

import { onMount, createEventDispatcher } from 'svelte';
import { db } from '../store-db.js'
import { git } from '../store-git.js'
import Tree from './Tree.svelte'
const dispatch = createEventDispatcher();

export let key;
export let value;

export let arrow = false;
export let parent = '';
export let hidden = false;
export let repo = {};
export let root = false;
let child;
let open;
let determinate = true;

function onClick() {
	open = !open;
}

function onCheckedChange() {
	if (child) child.recursiveCheck( value.file.checked );
	dispatch('changed', value.file.checked);
}

function onReview( e ) {
	determinate = e.detail.determinate;
	value.file.checked = e.detail.checked;
	dispatch('review', e.detail);
}

export function recursiveCheck( b ) {
	value.file.checked = b;
	if (child) child.recursiveCheck( b );
}

$: isFolder = !value.path;

</script>

<div 
	class="tree"
	class:ml2={arrow}
	class:none={hidden}>
	<div class="flex justify-between">
		<div>
			<div class="checkbox">
				<input 
					bind:checked={value.file.checked} 
					type="checkbox" 
					indeterminate={!determinate} 
					on:change={onCheckedChange} />
				<span />
			</div>
			<a 
				href="#/project/{$db.current_project}/changes/diff?repo={repo.path}&path={value.file.path}"
				on:click={onClick}
				class:selected={value.file.checked}
				class:unselected={!value.file.checked}>
				{key}{#if isFolder}/{/if}
			</a>
		</div>
		<div 
			class:ok={value.file.flag=='staged'}
			class:alert={value.file.flag=='created'}>
			{value.file.flag || ""}
		</div>
	</div>
	<Tree 
		bind:this={child} 
		bind:tree={value.children} 
		on:review={onReview}
		{repo}
		{root}
		hidden={open}
		arrow={true} />
</div>