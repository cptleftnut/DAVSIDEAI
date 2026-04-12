<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<div class="agent-buttons">
	<button on:click={() => dispatch('search')}>🔍 Søg boliger</button>
	<button on:click={() => dispatch('negotiation')}>🤝 Forhandling</button>
	<button on:click={() => dispatch('contract')}>📄 Kontrakt-tjek</button>
</div>

<style>
	.agent-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin: 16px 0;
	}
	button {
		padding: 16px 12px;
		background: #1f1f1f;
		border: 1px solid #444;
		border-radius: 10px;
		color: #ddd;
		font-size: 15px;
		cursor: pointer;
		transition: background 0.2s;
	}
	button:hover { background: #2a2a2a; }
</style>
