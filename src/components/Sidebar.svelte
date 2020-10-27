<script>
  import { onMount } from 'svelte';
  import { store } from '../store.js'

  const ipc  = require('electron').ipcRenderer;

  let name = "";

  onMount(async () => {
    // console.log($store, store);
  });
  function onNew() {
    store.neu( name );
  }

  function onRemove(k) {
    console.log(k);
    store.remove(k)
  }

</script>

<style>

</style>

<nav> 
  <input type="text" bind:value={name} />
  <button on:click={onNew} >New</button>
  <!-- <p>{JSON.stringify($store)}</p> -->
  <ul>
    {#each Object.keys( $store.projects ) as k}
      <li><a href={`#/project/${k}`}>{k}</a> <a on:click={() => onRemove(k)}>X</a></li>
    {/each}
  </ul>
  <p>
    <a href="#/about">About</a>
  </p>
</nav>