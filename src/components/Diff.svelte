<script>
import { onMount, createEventDispatcher } from 'svelte';
import { routes, active, matches, params, query } from 'svelte-hash-router'
import { db } from '../store-db.js'
import { git } from '../store-git.js'

let diff = '';

$: _path = () => {

	// console.log('a', $routes)
	// console.log('b', $active)
	// console.log('c', $matches)
	// console.log('d', $params)
	// console.log('e', $query)

	console.log('[Diff.svelte] 📃  getting diff doc...');
	git.getRaw( $query.repo, ['diff', './'+$query.path] ).then( res => {
		console.log('[Diff.svelte] ✅📃  got diff doc:', res.length);
		const limit = 300000;
		if (res.length > limit) res = res.substring(0, limit) + '\n\nreached end of renderable file...';
		diff = res;
	}).catch( err => {
		console.log('[Diff.svelte] ❌📃  error getting diff:', err.message);
	})

	return $query.path;

}
$: project = $db.projects[$db.current_project];
$: repo = $query.repo;
$: path = _path();

</script>

<div class="bright mb1">{repo} {path}</div>

<div>
{#each diff.split('\n') as line, i }
<div 
	class:ok={line[0]=='@' && line[1]=='@'}
	class:added={line[0]=='+'}
	class:removed={line[0]=='-'} >{line}</div>
{/each}


</div>