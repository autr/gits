<script>
  import { onMount } from 'svelte';
  import { db } from '../store-db.js'

  const ipc  = require('electron').ipcRenderer;

  let name = "";

  onMount(async () => {
    // console.log($db, db);
  });
  function onNew() {
    db.neuProject( name );
  }

  function onRemove(k) {
    console.log('[Sidebar.svelte] 🛑  removing project...', k, $db.current_project);
    if (k == $db.current_project) window.location.hash = '#/';
    setTimeout( () => db.removeProject(k), 1);
  }


</script>

<style>

</style>

<nav class="sidebar p1">
  <h2>Projects</h2>
  <input type="text" bind:value={name} />
  <button on:click={onNew} >create new project</button>
  <button on:click={onNew} >settings</button>
  <div><a href="#/">Overview</a></div>
  <div><a href="#/about">About</a></div>
  <div class="projects">
    {#each Object.keys( $db.projects ) as k}
      <div>
        <a href={`#/project/${k}/changes`}>{k}</a> 
        <span on:click={() => onRemove(k)}>✖</span>
      </div>
    {/each}
  </div>
</nav>