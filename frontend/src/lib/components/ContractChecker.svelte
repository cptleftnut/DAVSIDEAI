<script lang="ts">
	import { invoke } from '../tauri-mock';

	interface ContractIssue {
		severity: 'high' | 'medium' | 'low';
		title: string;
		description: string;
		section: string;
	}

	interface ContractResult {
		score: number;
		issues: ContractIssue[];
		positives: string[];
		recommendation: string;
	}

	let contractText = $state('');
	let result = $state<ContractResult | null>(null);
	let isLoading = $state(false);
	let showResult = $state(false);
	let activeTab = $state<'issues' | 'positives'>('issues');

	const sampleContract = `LEJEKONTRAKT
Udlejer: Hans Hansen, Strandvej 12, 2900 Hellerup
Lejer: Mette Petersen

§1 Det lejede
Lejemålet er beliggende Østerbrogade 45, 2. th., 2100 København Ø.
Lejemålet er på 72 m² og består af 3 rum.

§2 Lejeperiode
Lejeforholdet begynder den 1. juni 2025.

§3 Husleje
Den månedlige husleje er kr. 12.500.
Depositum udgør kr. 37.500 (3 måneders husleje).

§5 Vedligeholdelse
Lejer er ansvarlig for indvendig vedligeholdelse.

§8 Opsigelse
Lejeren kan opsige lejemålet med 3 måneders varsel.

§12 Husorden
Lejer skal overholde ejendommens husordensregler.`;

	async function analyze() {
		if (!contractText.trim()) return;
		isLoading = true;
		showResult = false;
		result = null;
		try {
			const res = await invoke<ContractResult>('check_contract', {
				contract_text: contractText
			});
			result = res;
			showResult = true;
		} catch (e) {
			console.error('Kontraktfejl:', e);
		}
		isLoading = false;
	}

	function loadSample() {
		contractText = sampleContract;
	}

	function scoreColor(score: number) {
		if (score >= 80) return '#22c55e';
		if (score >= 60) return '#f59e0b';
		return '#ef4444';
	}

	function scoreLabel(score: number) {
		if (score >= 80) return 'God kontrakt';
		if (score >= 60) return 'Acceptabel';
		return 'Problematisk';
	}

	function severityColor(severity: string) {
		if (severity === 'high') return '#ef4444';
		if (severity === 'medium') return '#f59e0b';
		return '#888';
	}

	function severityLabel(severity: string) {
		if (severity === 'high') return 'Kritisk';
		if (severity === 'medium') return 'Advarsel';
		return 'Info';
	}
</script>

<div class="contract-panel">
	<div class="panel-header">
		<h3>Kontrakt-tjek</h3>
		<span class="badge">AI</span>
	</div>
	<p class="panel-desc">Analysér din lejekontrakt for problemer og mangler</p>

	<div class="input-area">
		<div class="input-toolbar">
			<label>Indsæt kontrakttekst</label>
			<button class="sample-btn" onclick={loadSample}>Brug eksempel</button>
		</div>
		<textarea
			bind:value={contractText}
			rows="8"
			placeholder="Indsæt din lejekontrakt her... Du kan også klikke 'Brug eksempel' for at se en demo."
		></textarea>
		<div class="char-count">{contractText.length} tegn</div>
	</div>

	<button class="analyze-btn" onclick={analyze} disabled={isLoading || !contractText.trim()}>
		{#if isLoading}
			<span class="spinner"></span>
			<span>Analyserer kontrakt...</span>
		{:else}
			<span>📄</span>
			<span>Analyser kontrakt</span>
		{/if}
	</button>

	{#if showResult && result}
		<div class="result animate-in">
			<!-- Score -->
			<div class="score-card">
				<div class="score-circle" style="--score-color: {scoreColor(result.score)}">
					<svg viewBox="0 0 36 36" class="score-svg">
						<path
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
							fill="none"
							stroke="#2a2a2a"
							stroke-width="3"
						/>
						<path
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
							fill="none"
							stroke={scoreColor(result.score)}
							stroke-width="3"
							stroke-dasharray="{result.score}, 100"
						/>
					</svg>
					<div class="score-inner">
						<span class="score-num">{result.score}</span>
						<span class="score-max">/100</span>
					</div>
				</div>
				<div class="score-info">
					<div class="score-label" style="color: {scoreColor(result.score)}">{scoreLabel(result.score)}</div>
					<div class="score-summary">
						{result.issues.filter(i => i.severity === 'high').length} kritiske problemer •
						{result.issues.filter(i => i.severity === 'medium').length} advarsler •
						{result.positives.length} positive punkter
					</div>
				</div>
			</div>

			<!-- Recommendation -->
			<div class="recommendation-box">
				<span class="rec-icon">💡</span>
				<p>{result.recommendation}</p>
			</div>

			<!-- Tabs -->
			<div class="tabs">
				<button
					class="tab {activeTab === 'issues' ? 'active' : ''}"
					onclick={() => activeTab = 'issues'}
				>
					⚠️ Problemer ({result.issues.length})
				</button>
				<button
					class="tab {activeTab === 'positives' ? 'active' : ''}"
					onclick={() => activeTab = 'positives'}
				>
					✅ Positive ({result.positives.length})
				</button>
			</div>

			{#if activeTab === 'issues'}
				<div class="issues-list">
					{#each result.issues as issue}
						<div class="issue-card">
							<div class="issue-header">
								<span class="severity-badge" style="background: {severityColor(issue.severity)}20; color: {severityColor(issue.severity)}; border: 1px solid {severityColor(issue.severity)}40">
									{severityLabel(issue.severity)}
								</span>
								<span class="issue-section">{issue.section}</span>
							</div>
							<h4 class="issue-title">{issue.title}</h4>
							<p class="issue-desc">{issue.description}</p>
						</div>
					{/each}
				</div>
			{/if}

			{#if activeTab === 'positives'}
				<div class="positives-list">
					{#each result.positives as positive}
						<div class="positive-item">
							<span class="positive-icon">✓</span>
							<span>{positive}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.contract-panel {
		background: #141414;
		border: 1px solid #2a2a2a;
		border-radius: 16px;
		padding: 20px;
	}

	.panel-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
	.panel-header h3 { font-size: 1.1rem; font-weight: 700; color: #fff; }
	.badge {
		font-size: 10px;
		font-weight: 700;
		padding: 2px 8px;
		background: linear-gradient(135deg, #7c3aed, #a855f7);
		border-radius: 20px;
		color: white;
	}

	.panel-desc { font-size: 13px; color: #888; margin-bottom: 16px; }

	.input-area { margin-bottom: 14px; }
	.input-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}
	.input-toolbar label { font-size: 12px; color: #888; }
	.sample-btn {
		font-size: 11px;
		padding: 4px 10px;
		background: transparent;
		border: 1px solid #333;
		border-radius: 6px;
		color: #888;
		cursor: pointer;
	}
	.sample-btn:hover { border-color: #555; color: #ccc; }

	textarea {
		width: 100%;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 10px;
		color: #e0e0e0;
		padding: 12px;
		font-size: 12px;
		resize: vertical;
		font-family: 'Courier New', monospace;
		line-height: 1.5;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}
	textarea:focus { outline: none; border-color: #a855f7; }

	.char-count { font-size: 11px; color: #555; text-align: right; margin-top: 4px; }

	.analyze-btn {
		width: 100%;
		padding: 14px;
		background: linear-gradient(135deg, #7c3aed, #a855f7);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: opacity 0.2s;
	}
	.analyze-btn:hover:not(:disabled) { opacity: 0.9; }
	.analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.result { margin-top: 20px; }

	.score-card {
		display: flex;
		align-items: center;
		gap: 16px;
		background: #1a1a1a;
		border-radius: 14px;
		padding: 16px;
		margin-bottom: 14px;
	}

	.score-circle { position: relative; width: 70px; height: 70px; flex-shrink: 0; }
	.score-svg { width: 70px; height: 70px; transform: rotate(-90deg); }
	.score-inner {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.score-num { font-size: 1.4rem; font-weight: 700; color: var(--score-color, #fff); }
	.score-max { font-size: 10px; color: #666; }

	.score-info { flex: 1; }
	.score-label { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
	.score-summary { font-size: 12px; color: #888; line-height: 1.5; }

	.recommendation-box {
		display: flex;
		gap: 10px;
		background: #1a1a1a;
		border-left: 3px solid #f59e0b;
		border-radius: 0 10px 10px 0;
		padding: 12px;
		margin-bottom: 14px;
	}
	.rec-icon { font-size: 1.2rem; flex-shrink: 0; }
	.recommendation-box p { font-size: 13px; color: #ddd; line-height: 1.6; }

	.tabs { display: flex; gap: 8px; margin-bottom: 14px; }
	.tab {
		flex: 1;
		padding: 10px;
		background: #1a1a1a;
		border: 1px solid #2a2a2a;
		border-radius: 10px;
		color: #888;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.tab.active { background: #2a2a2a; border-color: #444; color: #fff; }

	.issues-list { display: flex; flex-direction: column; gap: 10px; }
	.issue-card {
		background: #1a1a1a;
		border-radius: 12px;
		padding: 14px;
		border-left: 3px solid #333;
	}
	.issue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
	.severity-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
	.issue-section { font-size: 11px; color: #666; }
	.issue-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 6px; }
	.issue-desc { font-size: 13px; color: #aaa; line-height: 1.5; }

	.positives-list { display: flex; flex-direction: column; gap: 8px; }
	.positive-item {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		background: #1a1a1a;
		border-radius: 10px;
		padding: 12px;
	}
	.positive-icon {
		color: #22c55e;
		font-weight: 700;
		flex-shrink: 0;
	}
	.positive-item span:last-child { font-size: 13px; color: #ddd; line-height: 1.5; }
</style>
