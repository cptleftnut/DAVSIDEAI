<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let currentStep = $state(1);
	let apiKey = $state('');
	let isValidating = $state(false);
	let validationResult = $state<{valid: boolean; message: string} | null>(null);
	let isSaving = $state(false);

	async function validateKey() {
		if (!apiKey) return;
		isValidating = true;
		try {
			const valid = await invoke('validate_api_key', { key: apiKey });
			validationResult = {
				valid,
				message: valid ? "Nøglen er gyldig ✓" : "Ugyldig nøgle – skal starte med xai-"
			};
		} catch (e) {
			validationResult = { valid: false, message: "Valideringsfejl" };
		} finally {
			isValidating = false;
		}
	}

	async function saveAndContinue() {
		if (!validationResult?.valid) return;
		isSaving = true;
		await invoke('save_api_key', { key: apiKey });
		currentStep = 3;
		isSaving = false;
	}

	function skipWizard() {
		if (confirm("Vil du springe opsætningen over?")) dispatch('close');
	}
</script>

{#if currentStep === 1}
	<div class="wizard-overlay">
		<div class="wizard-card">
			<h1>Velkommen til DAVSIDE AI</h1>
			<p>Din personlige danske AI-boligagent med Grok Imagine.</p>
			<div class="buttons">
				<button on:click={() => currentStep = 2} class="primary">Kom i gang</button>
				<button on:click={skipWizard} class="secondary">Spring over</button>
			</div>
		</div>
	</div>
{/if}

{#if currentStep === 2}
	<div class="wizard-overlay">
		<div class="wizard-card">
			<h2>Trin 2/3 — API-nøgle</h2>
			<p>Indtast din XAI API-nøgle for at aktivere billed- og video-generering.</p>

			<input
				type="password"
				bind:value={apiKey}
				placeholder="xai-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
				on:input={validateKey}
			/>

			<button on:click={validateKey} disabled={isValidating || !apiKey}>
				{isValidating ? "Validerer..." : "Valider nøgle"}
			</button>

			{#if validationResult}
				<div class={validationResult.valid ? "success" : "error"}>
					{validationResult.message}
				</div>
			{/if}

			<div class="buttons">
				<button on:click={() => currentStep = 1}>Tilbage</button>
				<button
					on:click={saveAndContinue}
					disabled={!validationResult?.valid || isSaving}
					class="primary"
				>
					{isSaving ? "Gemmer..." : "Gem nøgle og fortsæt"}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if currentStep === 3}
	<div class="wizard-overlay">
		<div class="wizard-card">
			<h2>Du er klar!</h2>
			<ul>
				<li>✓ Søg boliger</li>
				<li>✓ Få forhandlingsforslag</li>
				<li>✓ Tjek lejekontrakter</li>
				<li>✓ Generér billeder og videoer</li>
			</ul>
			<button on:click={() => dispatch('close')} class="primary">Start DAVSIDE AI</button>
		</div>
	</div>
{/if}

<style>
	.wizard-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
	}
	.wizard-card {
		background: #1e1e1e;
		border: 1px solid #444;
		border-radius: 16px;
		padding: 40px 30px;
		max-width: 460px;
		text-align: center;
	}
	input {
		width: 100%;
		padding: 14px;
		background: #252526;
		border: 1px solid #555;
		border-radius: 8px;
		color: white;
		font-family: monospace;
		margin: 16px 0;
		box-sizing: border-box;
	}
	.buttons { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
	.primary { background: #007acc; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; }
	.secondary { background: transparent; color: #aaa; border: 1px solid #555; border-radius: 8px; padding: 12px 24px; cursor: pointer; }
	.success { color: #28a745; margin: 12px 0; }
	.error { color: #ff5555; margin: 12px 0; }
	button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
