<script>
import Router from 'svelte-hash-router'
import Sidebar from './components/Sidebar.svelte'
import { onMount } from 'svelte';
import { store } from './store.js'


onMount(async () => {
  store.load();
});

</script>


{#if $store.state > 0}
  <Sidebar /> 
  <Router />
{/if}