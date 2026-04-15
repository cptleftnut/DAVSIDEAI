<script lang="ts">
	import { invoke } from '../tauri-mock';

	let { onclose }: { onclose: () => void } = $props();

	let currentStep = $state(1);
	let apiKey = $state('');
	let isValidating = $state(false);
	let isSaving = $state(false);
	let validationResult = $state<{ valid: boolean; message: string } | null>(null);

	async function validateKey() {
		if (!apiKey.trim()) return;
		isValidating = true;
		validationResult = null;
		try {
			const isValid = await invoke<boolean>('validate_api_key', { key: apiKey });
			validationResult = {
				valid: isValid,
				message: isValid
					? '✓ API-nøgle er gyldig og klar til brug'
					: '✗ Ugyldig nøgle. Skal starte med "xai-"'
			};
		} catch {
			validationResult = { valid: false, message: '✗ Kunne ikke validere nøglen' };
		}
		isValidating = false;
	}

	async function saveAndContinue() {
		if (!validationResult?.valid) return;
		isSaving = true;
		try {
			await invoke('save_api_key', { key: apiKey });
			localStorage.setItem('davside_setup_done', '1');
			currentStep = 3;
		} catch {
			// ignore
		}
		isSaving = false;
	}

	function skipWizard() {
		localStorage.setItem('davside_setup_done', '1');
		onclose();
	}

	function finishSetup() {
		onclose();
	}
</script>

<div class="wizard-overlay">
	{#if currentStep === 1}
		<div class="wizard-card animate-in">
			<div class="wizard-logo">
				<span class="logo-icon">🏠</span>
				<span class="logo-text">DAVSIDE AI</span>
			</div>
			<h1>Velkommen til DAVSIDE AI</h1>
			<p>Din personlige AI-boligagent til det danske marked.</p>

			<div class="feature-list">
				<div class="feature">
					<span class="feature-icon">🔍</span>
					<div>
						<strong>Smart boligsøgning</strong>
						<p>Find boliger med naturlig sprogforståelse</p>
					</div>
				</div>
				<div class="feature">
					<span class="feature-icon">🤝</span>
					<div>
						<strong>Forhandlingsagent</strong>
						<p>AI-drevet forhandlingsstrategi</p>
					</div>
				</div>
				<div class="feature">
					<span class="feature-icon">📄</span>
					<div>
						<strong>Kontrakt-tjek</strong>
						<p>Automatisk analyse af lejekontrakten</p>
					</div>
				</div>
				<div class="feature">
					<span class="feature-icon">📷</span>
					<div>
						<strong>Virtual Staging</strong>
						<p>AI-genererede interiørbilleder med Grok</p>
					</div>
				</div>
			</div>

			<div class="wizard-buttons">
				<button onclick={() => currentStep = 2} class="primary-btn">Kom i gang →</button>
				<button onclick={skipWizard} class="skip-btn">Spring over</button>
			</div>
		</div>

	{:else if currentStep === 2}
		<div class="wizard-card animate-in">
			<div class="step-indicator">
				<span class="step active">1</span>
				<span class="step-line active"></span>
				<span class="step active">2</span>
				<span class="step-line"></span>
				<span class="step">3</span>
			</div>
			<h2>XAI API-nøgle</h2>
			<p>Indtast din XAI API-nøgle for at aktivere Grok Imagine til virtual staging.</p>

			<div class="api-info">
				<span>ℹ️</span>
				<span>Hent din nøgle på <a href="https://x.ai" target="_blank" rel="noopener">x.ai</a>. Nøglen starter med "xai-"</span>
			</div>

			<div class="key-input-wrap">
				<input
					type="password"
					bind:value={apiKey}
					placeholder="xai-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
					oninput={validateKey}
					class="key-input"
				/>
				{#if validationResult}
					<div class="validation-msg {validationResult.valid ? 'valid' : 'invalid'}">
						{validationResult.message}
					</div>
				{/if}
			</div>

			<div class="wizard-buttons">
				<button onclick={() => currentStep = 1} class="back-btn">← Tilbage</button>
				<button
					onclick={saveAndContinue}
					disabled={!validationResult?.valid || isSaving || isValidating}
					class="primary-btn"
				>
					{isSaving ? 'Gemmer...' : 'Gem og fortsæt →'}
				</button>
			</div>
			<button onclick={skipWizard} class="skip-link">Spring API-opsætning over</button>
		</div>

	{:else if currentStep === 3}
		<div class="wizard-card animate-in">
			<div class="success-icon">🎉</div>
			<h2>Du er klar!</h2>
			<p>DAVSIDE AI er nu konfigureret og klar til brug.</p>

			<div class="ready-list">
				<div class="ready-item">✓ Boligsøgning aktiveret</div>
				<div class="ready-item">✓ Forhandlingsagent klar</div>
				<div class="ready-item">✓ Kontrakt-tjek klar</div>
				<div class="ready-item">✓ Virtual Staging klar</div>
			</div>

			<button onclick={finishSetup} class="primary-btn full">Start DAVSIDE AI →</button>
		</div>
	{/if}
</div>

<style>
	.wizard-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 20px;
	}

	.wizard-card {
		background: #141414;
		border: 1px solid #2a2a2a;
		border-radius: 20px;
		padding: 32px 24px;
		max-width: 420px;
		width: 100%;
		text-align: center;
	}

	.wizard-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin-bottom: 20px;
	}
	.logo-icon { font-size: 2rem; }
	.logo-text { font-size: 1.4rem; font-weight: 800; color: #00bbff; letter-spacing: 1px; }

	h1 { font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
	h2 { font-size: 1.3rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
	p { font-size: 14px; color: #888; margin-bottom: 20px; }

	.feature-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; text-align: left; }
	.feature { display: flex; gap: 12px; align-items: flex-start; }
	.feature-icon { font-size: 1.4rem; flex-shrink: 0; }
	.feature strong { display: block; font-size: 14px; color: #fff; margin-bottom: 2px; }
	.feature p { font-size: 12px; color: #888; margin: 0; }

	.step-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 24px;
	}
	.step {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: #2a2a2a;
		color: #666;
		font-size: 12px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.step.active { background: #007acc; color: white; }
	.step-line { flex: 1; height: 2px; background: #2a2a2a; max-width: 40px; }
	.step-line.active { background: #007acc; }

	.api-info {
		display: flex;
		gap: 8px;
		background: #1a1a1a;
		border-radius: 10px;
		padding: 10px 12px;
		font-size: 12px;
		color: #888;
		text-align: left;
		margin-bottom: 16px;
	}
	.api-info a { color: #00bbff; }

	.key-input-wrap { margin-bottom: 20px; text-align: left; }
	.key-input {
		width: 100%;
		padding: 14px;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 10px;
		color: white;
		font-family: monospace;
		font-size: 13px;
		box-sizing: border-box;
		transition: border-color 0.2s;
	}
	.key-input:focus { outline: none; border-color: #00bbff; }

	.validation-msg {
		margin-top: 8px;
		font-size: 13px;
		padding: 8px 12px;
		border-radius: 8px;
	}
	.validation-msg.valid { color: #22c55e; background: #22c55e10; }
	.validation-msg.invalid { color: #ef4444; background: #ef444410; }

	.wizard-buttons {
		display: flex;
		gap: 10px;
		justify-content: center;
		margin-bottom: 12px;
	}

	.primary-btn {
		padding: 12px 24px;
		background: #007acc;
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}
	.primary-btn.full { width: 100%; }
	.primary-btn:hover:not(:disabled) { background: #0090e0; }
	.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.back-btn {
		padding: 12px 20px;
		background: transparent;
		color: #888;
		border: 1px solid #333;
		border-radius: 10px;
		font-size: 14px;
		cursor: pointer;
	}
	.back-btn:hover { border-color: #555; color: #ccc; }

	.skip-btn {
		padding: 12px 20px;
		background: transparent;
		color: #666;
		border: 1px solid #2a2a2a;
		border-radius: 10px;
		font-size: 14px;
		cursor: pointer;
	}

	.skip-link {
		background: none;
		border: none;
		color: #555;
		font-size: 12px;
		cursor: pointer;
		text-decoration: underline;
	}
	.skip-link:hover { color: #888; }

	.success-icon { font-size: 3rem; margin-bottom: 16px; }

	.ready-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
	.ready-item {
		background: #1a1a1a;
		border-radius: 8px;
		padding: 10px 14px;
		font-size: 14px;
		color: #22c55e;
		text-align: left;
	}
</style>
