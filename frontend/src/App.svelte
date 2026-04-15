<script lang="ts">
	import { onMount } from 'svelte';
	import { invoke } from './lib/tauri-mock';
	import SetupWizard from './lib/components/SetupWizard.svelte';
	import BoligSearchUI from './lib/components/BoligSearchUI.svelte';
	import NegotiationAgent from './lib/components/NegotiationAgent.svelte';
	import ContractChecker from './lib/components/ContractChecker.svelte';
	import StagingPanel from './lib/components/StagingPanel.svelte';

	type Tab = 'search' | 'negotiate' | 'contract' | 'staging';

	let showWizard = $state(false);
	let activeTab = $state<Tab>('search');

	onMount(async () => {
		try {
			const isFirst = await invoke<boolean>('is_first_run');
			if (isFirst) showWizard = true;
		} catch {
			// Not in Tauri context
		}
	});

	const tabs: { id: Tab; icon: string; label: string }[] = [
		{ id: 'search', icon: '🔍', label: 'Søg' },
		{ id: 'negotiate', icon: '🤝', label: 'Forhandl' },
		{ id: 'contract', icon: '📄', label: 'Kontrakt' },
		{ id: 'staging', icon: '📷', label: 'Staging' },
	];
</script>

{#if showWizard}
	<SetupWizard onclose={() => showWizard = false} />
{/if}

<div class="app">
	<!-- Header -->
	<header class="app-header">
		<div class="header-left">
			<span class="header-logo">🏠</span>
			<span class="header-title">DAVSIDE AI</span>
		</div>
		<div class="header-right">
			<button class="settings-btn" onclick={() => showWizard = true} title="Indstillinger">
				⚙️
			</button>
		</div>
	</header>

	<!-- Content -->
	<main class="app-content">
		{#if activeTab === 'search'}
			<BoligSearchUI />
		{:else if activeTab === 'negotiate'}
			<NegotiationAgent />
		{:else if activeTab === 'contract'}
			<ContractChecker />
		{:else if activeTab === 'staging'}
			<StagingPanel />
		{/if}
	</main>

	<!-- Bottom Navigation -->
	<nav class="bottom-nav">
		{#each tabs as tab}
			<button
				class="nav-item {activeTab === tab.id ? 'active' : ''}"
				onclick={() => activeTab = tab.id}
			>
				<span class="nav-icon">{tab.icon}</span>
				<span class="nav-label">{tab.label}</span>
			</button>
		{/each}
	</nav>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 480px;
		margin: 0 auto;
		background: #0a0a0a;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		background: #0a0a0a;
		border-bottom: 1px solid #1a1a1a;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-left { display: flex; align-items: center; gap: 8px; }
	.header-logo { font-size: 1.4rem; }
	.header-title {
		font-size: 1.1rem;
		font-weight: 800;
		color: #00bbff;
		letter-spacing: 1px;
	}

	.settings-btn {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
	}
	.settings-btn:hover { opacity: 1; }

	.app-content {
		flex: 1;
		padding: 20px 16px;
		padding-bottom: 80px;
		overflow-y: auto;
	}

	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 480px;
		display: flex;
		background: #0f0f0f;
		border-top: 1px solid #1a1a1a;
		padding: 8px 0 env(safe-area-inset-bottom, 8px);
		z-index: 100;
	}

	.nav-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 8px 4px;
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		border-radius: 10px;
		margin: 0 4px;
	}

	.nav-icon { font-size: 1.3rem; transition: transform 0.2s; }
	.nav-label { font-size: 10px; color: #555; font-weight: 500; transition: color 0.2s; }

	.nav-item.active .nav-icon { transform: scale(1.1); }
	.nav-item.active .nav-label { color: #00bbff; }
	.nav-item:hover .nav-label { color: #888; }
</style>
