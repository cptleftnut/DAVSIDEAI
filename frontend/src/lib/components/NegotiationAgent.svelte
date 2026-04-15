<script lang="ts">
	import { invoke } from '../tauri-mock';

	interface NegotiationResult {
		suggestion: number;
		reasoning: string;
		tactics: string[];
		market_avg: number;
		confidence: number;
	}

	let askingPrice = $state(12000);
	let propertyDesc = $state('');
	let result = $state<NegotiationResult | null>(null);
	let isLoading = $state(false);
	let showResult = $state(false);

	async function analyze() {
		if (askingPrice <= 0) return;
		isLoading = true;
		showResult = false;
		result = null;
		try {
			const res = await invoke<NegotiationResult>('negotiate', {
				asking_price: askingPrice,
				property_desc: propertyDesc,
				market_data: null
			});
			result = res;
			showResult = true;
		} catch (e) {
			console.error('Forhandlingsfejl:', e);
		}
		isLoading = false;
	}

	function savingsAmount() {
		if (!result) return 0;
		return askingPrice - result.suggestion;
	}

	function savingsPerYear() {
		return savingsAmount() * 12;
	}
</script>

<div class="negotiation-panel">
	<div class="panel-header">
		<h3>Forhandlingsagent</h3>
		<span class="badge">AI</span>
	</div>
	<p class="panel-desc">Få AI-drevet forhandlingsstrategi baseret på markedsdata</p>

	<div class="input-group">
		<label>Udbudt husleje (kr/md)</label>
		<div class="price-input-wrap">
			<input
				type="number"
				bind:value={askingPrice}
				min="1000"
				max="100000"
				step="100"
				class="price-input"
				placeholder="12000"
			/>
			<span class="price-suffix">kr/md</span>
		</div>
	</div>

	<div class="input-group">
		<label>Boligbeskrivelse (valgfrit)</label>
		<textarea
			bind:value={propertyDesc}
			rows="2"
			placeholder="F.eks. '3-værelses på Østerbro, 85 m², 3. sal, nyistandsat'"
		></textarea>
	</div>

	<button class="analyze-btn" onclick={analyze} disabled={isLoading || askingPrice <= 0}>
		{#if isLoading}
			<span class="spinner"></span>
			<span>Analyserer marked...</span>
		{:else}
			<span>🤝</span>
			<span>Analyser forhandlingsmuligheder</span>
		{/if}
	</button>

	{#if showResult && result}
		<div class="result animate-in">
			<div class="result-hero">
				<div class="result-suggestion">
					<span class="suggestion-label">Anbefalet bud</span>
					<span class="suggestion-price">{result.suggestion.toLocaleString('da-DK')} kr/md</span>
					<span class="suggestion-savings">Spar {savingsAmount().toLocaleString('da-DK')} kr/md • {savingsPerYear().toLocaleString('da-DK')} kr/år</span>
				</div>
				<div class="confidence-ring">
					<svg viewBox="0 0 36 36" class="ring-svg">
						<path
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
							fill="none"
							stroke="#2a2a2a"
							stroke-width="3"
						/>
						<path
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
							fill="none"
							stroke="#00bbff"
							stroke-width="3"
							stroke-dasharray="{result.confidence}, 100"
						/>
					</svg>
					<span class="confidence-text">{result.confidence}%</span>
					<span class="confidence-label">sikkerhed</span>
				</div>
			</div>

			<div class="market-compare">
				<div class="compare-item">
					<span class="compare-label">Udbudt pris</span>
					<span class="compare-value negative">{askingPrice.toLocaleString('da-DK')} kr</span>
				</div>
				<div class="compare-arrow">→</div>
				<div class="compare-item">
					<span class="compare-label">Markedsgennemsnit</span>
					<span class="compare-value neutral">{result.market_avg.toLocaleString('da-DK')} kr</span>
				</div>
				<div class="compare-arrow">→</div>
				<div class="compare-item">
					<span class="compare-label">Dit bud</span>
					<span class="compare-value positive">{result.suggestion.toLocaleString('da-DK')} kr</span>
				</div>
			</div>

			<div class="reasoning-box">
				<h4>AI-analyse</h4>
				<p>{result.reasoning}</p>
			</div>

			<div class="tactics-box">
				<h4>Forhandlingstaktikker</h4>
				<ul>
					{#each result.tactics as tactic, i}
						<li>
							<span class="tactic-num">{i + 1}</span>
							<span>{tactic}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>

<style>
	.negotiation-panel {
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
		background: linear-gradient(135deg, #22c55e, #16a34a);
		border-radius: 20px;
		color: white;
	}

	.panel-desc { font-size: 13px; color: #888; margin-bottom: 16px; }

	.input-group { margin-bottom: 14px; }
	.input-group label { font-size: 12px; color: #888; display: block; margin-bottom: 6px; }

	.price-input-wrap { position: relative; }
	.price-input {
		width: 100%;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 10px;
		color: #e0e0e0;
		padding: 12px 60px 12px 14px;
		font-size: 16px;
		font-weight: 600;
		box-sizing: border-box;
		transition: border-color 0.2s;
	}
	.price-input:focus { outline: none; border-color: #22c55e; }
	.price-suffix {
		position: absolute;
		right: 14px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 12px;
		color: #666;
	}

	textarea {
		width: 100%;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 10px;
		color: #e0e0e0;
		padding: 12px;
		font-size: 13px;
		resize: none;
		font-family: inherit;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}
	textarea:focus { outline: none; border-color: #22c55e; }

	.analyze-btn {
		width: 100%;
		padding: 14px;
		background: linear-gradient(135deg, #16a34a, #22c55e);
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

	.result-hero {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #1a1a1a;
		border: 1px solid #2a2a2a;
		border-radius: 14px;
		padding: 16px;
		margin-bottom: 14px;
	}

	.result-suggestion { flex: 1; }
	.suggestion-label { display: block; font-size: 11px; color: #888; margin-bottom: 4px; }
	.suggestion-price { display: block; font-size: 1.6rem; font-weight: 700; color: #22c55e; margin-bottom: 4px; }
	.suggestion-savings { display: block; font-size: 12px; color: #888; }

	.confidence-ring { position: relative; width: 60px; height: 60px; flex-shrink: 0; text-align: center; }
	.ring-svg { width: 60px; height: 60px; transform: rotate(-90deg); }
	.confidence-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -60%);
		font-size: 13px;
		font-weight: 700;
		color: #00bbff;
	}
	.confidence-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, 20%);
		font-size: 9px;
		color: #666;
		white-space: nowrap;
	}

	.market-compare {
		display: flex;
		align-items: center;
		gap: 8px;
		background: #1a1a1a;
		border-radius: 12px;
		padding: 12px;
		margin-bottom: 14px;
		overflow-x: auto;
	}
	.compare-item { text-align: center; flex: 1; min-width: 80px; }
	.compare-label { display: block; font-size: 10px; color: #666; margin-bottom: 4px; }
	.compare-value { font-size: 13px; font-weight: 600; }
	.compare-value.negative { color: #ef4444; }
	.compare-value.neutral { color: #f59e0b; }
	.compare-value.positive { color: #22c55e; }
	.compare-arrow { color: #444; font-size: 16px; flex-shrink: 0; }

	.reasoning-box, .tactics-box {
		background: #1a1a1a;
		border-radius: 12px;
		padding: 14px;
		margin-bottom: 12px;
	}
	.reasoning-box h4, .tactics-box h4 {
		font-size: 13px;
		font-weight: 600;
		color: #aaa;
		margin-bottom: 8px;
	}
	.reasoning-box p { font-size: 13px; color: #ddd; line-height: 1.6; }

	.tactics-box ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
	.tactics-box li { display: flex; gap: 10px; align-items: flex-start; }
	.tactic-num {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		background: #22c55e;
		color: white;
		border-radius: 50%;
		font-size: 11px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.tactics-box li span:last-child { font-size: 13px; color: #ddd; line-height: 1.5; }
</style>
