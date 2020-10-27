<script>
  import { onMount } from 'svelte';
  import { store } from '../store.js'
  import { routes, active, matches, params, query } from 'svelte-hash-router'
  import hljs from 'highlight.js'


  onMount(async () => {
    getStatus();
    getDiff();
  });

  const types = ['conflicted', 'created', 'deleted', 'modified', 'not_added', 'renamed', 'staged'];
  const emojis = {
    'conflicted': '⚔️',
    'created': '✨',
    'deleted': '❌',
    'modified': '✏️',
    'not_added': '✨',
    'renamed': '✍️',
    'staged': '✅'
  }

  let statuses = [];
  let diffs = [];

  function getTag( status, path ) {
    for (let i = 0; i < types.length; i++ ) {
      const t = types[i];
      const l = status[ t ];
      if (l.indexOf(path) != -1) return t;
    }
  }

  function getStatus() {

      console.log('[Project.svelte] 🌀  getting git status...');
      promiseIpc
        .send('gitStatus', $store.projects[ $store.current_project ])
        .then((res, e) => {
          statuses = res;
        })
        .catch((e) => console.error(e))
  }

  function getDiff() {

      console.log('[Project.svelte] 🌀  getting git diffs...');
      promiseIpc
        .send('gitDiff', $store.projects[ $store.current_project ])
        .then((res, e) => {
          diffs = res;
        })
        .catch((e) => console.error(e))
  }


  $: _project = () => {
    if ($params.id != $store.current_project) {
      console.log('[Project.svelte] 🌀  updating current_project...');
      store.current( $params.id );
      getStatus();
      getDiff();
    }
    return $store.projects[ $store.current_project ];
  }

  $: _diff = () => {
    if (!$query.file) return;
    for (let i = 0; i < diffs.length; i++) {
      const d = diffs[i];
      if (d.indexOf(`diff --git a/${$query.file}`) != -1) {
        const lines = d.split('\n');
        return lines.map( (text) => {
          let type = 'none';
          if (text.substring(0,1) == '+') type = 'insertion';
          if (text.substring(0,1) == '-') type = 'deletion';
          if (text.substring(0,2) == '@@') type = 'info';
          text = hljs.highlightAuto(text).value;
          return { type, text }
        });
      }
    }
    return;
  }

  $: project = _project();
  $: diff = _diff();


</script>

<style>

</style>

<h1>{project.name}</h1>
<button on:click={store.add} >Add Repository</button>
{#each statuses as status, i }

  {#if project.repos[i] }
    <div class="repo">
      <h3>
        { project.repos[i].name} 
      </h3>
      <pre class="path">
        {project.repos[i].path}
        <span>>_</span> 
      </pre>
      <pre class="branch">
        {status.current} -> {status.tracking}
      </pre>
      <div 
        class="status"
        class:alert={status.behind > 0} 
        class:success={status.ahead == 0 && status.behind == 0 && status.files == 0}
        class:info={status.ahead > 0 && status.behind == 0}
        title={`${status.ahead} ahead, ${status.behind} behind`}
        >
        {status.ahead} ahead, {status.behind} behind
      </div>

      {#each status.files as file}
        <div>
          <input type="checkbox" id={file.path} />
          <label for={file.path} title={getTag( status, file.path )}>{emojis[getTag( status, file.path )]}</label>
          <a href={`#/project/${project.id}/diff?file=${file.path}`}>{file.path}</a>
        </div>
      {/each}
      {#if status.files == 0}
        <div>✅  Nothing to commit.</div>
      {/if}
    </div>

  {/if}
{/each}

<br />
<br />
<br />

<pre class="diff">
  {#if diff}
    {#each diff as line}
      {@html line.text}<br />
    {/each}

  {/if}

</pre>
