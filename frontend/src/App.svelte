<script lang="ts">
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/core';
	import SetupWizard from './lib/components/SetupWizard.svelte';
	import AgentButtons from './lib/components/AgentButtons.svelte';
	import StagingPanel from './lib/components/StagingPanel.svelte';
	import BoligSearchUI from './lib/components/BoligSearchUI.svelte';

	let showWizard = $state(false);

	onMount(async () => {
		try {
			const isFirst = await invoke('is_first_run');
			if (isFirst) showWizard = true;
		} catch (e) {}
	});
</script>

{#if showWizard}
	<SetupWizard on:close={() => showWizard = false} />
{/if}

<div class="davside-app">
	<header>DAVSIDE AI</header>

	<BoligSearchUI />

	<AgentButtons
		on:search={() => alert("Søgning aktiveret")}
		on:negotiation={() => alert("Forhandling aktiveret")}
		on:contract={() => alert("Kontrakt-tjek aktiveret")}
	/>

	<StagingPanel prompt="Lys moderne lejlighed med grønne planter og sofa" />

	<footer><small>DAVSIDE AI v0.3.0 • Mobil-first</small></footer>
</div>

<style>
	.davside-app { padding: 16px; background: #0a0a0a; min-height: 100vh; color: #ddd; }
	header { text-align: center; margin-bottom: 30px; font-size: 2rem; color: #00bbff; }
	footer { text-align: center; margin-top: 40px; opacity: 0.6; }
</style>
