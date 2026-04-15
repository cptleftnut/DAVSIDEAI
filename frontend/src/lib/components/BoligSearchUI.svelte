<script lang="ts">
	import { invoke } from '../tauri-mock';

	interface BoligResult {
		title: string;
		price: number;
		size: number;
		location: string;
		link?: string;
		rooms: number;
		type: string;
		floor: string;
		energy: string;
		available: string;
		description: string;
	}

	let query = $state('København, 2-værelses, max 14000 kr');
	let results = $state<BoligResult[]>([]);
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let selectedBolig = $state<BoligResult | null>(null);
	let showFilters = $state(false);
	let maxPrice = $state(20000);
	let minSize = $state(0);

	async function search() {
		isSearching = true;
		hasSearched = false;
		try {
			const res = await invoke<BoligResult[]>('search_boliger', {
				req: { query, min_price: 0, max_price: maxPrice, min_size: minSize }
			});
			results = res;
			hasSearched = true;
		} catch (e) {
			console.error('Søgefejl:', e);
		}
		isSearching = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			search();
		}
	}

	function energyColor(grade: string) {
		const colors: Record<string, string> = {
			'A': '#22c55e', 'B': '#84cc16', 'C': '#eab308',
			'D': '#f97316', 'E': '#ef4444', 'F': '#dc2626', 'G': '#991b1b'
		};
		return colors[grade] || '#888';
	}
</script>

<div class="search-section">
	<div class="search-header">
		<h2>Find din næste bolig</h2>
		<p class="subtitle">Søg blandt tusindvis af boliger i Danmark</p>
	</div>

	<div class="search-box">
		<div class="search-input-row">
			<div class="search-icon">🔍</div>
			<textarea
				bind:value={query}
				rows="2"
				placeholder="Prøv: 'Østerbro 3-værelses max 15000 kr' eller 'villa Gentofte'"
				onkeydown={handleKeydown}
				class="search-input"
			></textarea>
			<button onclick={search} disabled={isSearching} class="search-btn">
				{#if isSearching}
					<span class="spinner"></span>
				{:else}
					Søg
				{/if}
			</button>
		</div>

		<div class="filter-toggle" onclick={() => showFilters = !showFilters} role="button" tabindex="0">
			<span>⚙️ Filtre</span>
			<span>{showFilters ? '▲' : '▼'}</span>
		</div>

		{#if showFilters}
			<div class="filters animate-in">
				<div class="filter-group">
					<label>Maks. pris: <strong>{maxPrice.toLocaleString('da-DK')} kr/md</strong></label>
					<input type="range" min="5000" max="50000" step="500" bind:value={maxPrice} class="range-input" />
				</div>
				<div class="filter-group">
					<label>Min. størrelse: <strong>{minSize} m²</strong></label>
					<input type="range" min="0" max="200" step="5" bind:value={minSize} class="range-input" />
				</div>
			</div>
		{/if}
	</div>

	{#if isSearching}
		<div class="loading-state">
			<div class="loading-dots">
				<span></span><span></span><span></span>
			</div>
			<p>Søger boliger...</p>
		</div>
	{/if}

	{#if hasSearched && results.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🏠</div>
			<p>Ingen boliger fundet. Prøv en anden søgning.</p>
		</div>
	{/if}

	{#if results.length > 0}
		<div class="results-header">
			<span class="results-count">{results.length} boliger fundet</span>
		</div>
		<div class="results-grid">
			{#each results as bolig}
				<div class="bolig-card animate-in" onclick={() => selectedBolig = bolig} role="button" tabindex="0">
					<div class="card-header">
						<div class="card-type-badge">{bolig.type}</div>
						<div class="energy-badge" style="background: {energyColor(bolig.energy)}">
							{bolig.energy}
						</div>
					</div>
					<h3 class="card-title">{bolig.title}</h3>
					<p class="card-location">📍 {bolig.location}</p>
					<p class="card-description">{bolig.description}</p>
					<div class="card-meta">
						<span>🛏 {bolig.rooms} rum</span>
						<span>📐 {bolig.size} m²</span>
						<span>🏢 {bolig.floor}</span>
					</div>
					<div class="card-footer">
						<div class="card-price">
							<span class="price-amount">{bolig.price.toLocaleString('da-DK')}</span>
							<span class="price-unit">kr/md</span>
						</div>
						<div class="card-available">Fra {bolig.available}</div>
					</div>
					{#if bolig.link}
						<a href={bolig.link} target="_blank" rel="noopener noreferrer" class="card-link"
							onclick={(e) => e.stopPropagation()}>
							Se annonce →
						</a>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if selectedBolig}
	<div class="modal-overlay" onclick={() => selectedBolig = null} role="dialog">
		<div class="modal-content animate-in" onclick={(e) => e.stopPropagation()}>
			<button class="modal-close" onclick={() => selectedBolig = null}>✕</button>
			<div class="modal-header">
				<h2>{selectedBolig.title}</h2>
				<p class="modal-location">📍 {selectedBolig.location}</p>
			</div>
			<div class="modal-body">
				<div class="modal-stats">
					<div class="stat"><span class="stat-label">Pris</span><span class="stat-value primary">{selectedBolig.price.toLocaleString('da-DK')} kr/md</span></div>
					<div class="stat"><span class="stat-label">Størrelse</span><span class="stat-value">{selectedBolig.size} m²</span></div>
					<div class="stat"><span class="stat-label">Rum</span><span class="stat-value">{selectedBolig.rooms}</span></div>
					<div class="stat"><span class="stat-label">Type</span><span class="stat-value">{selectedBolig.type}</span></div>
					<div class="stat"><span class="stat-label">Etage</span><span class="stat-value">{selectedBolig.floor}</span></div>
					<div class="stat"><span class="stat-label">Energi</span><span class="stat-value">{selectedBolig.energy}</span></div>
				</div>
				<p class="modal-description">{selectedBolig.description}</p>
				<div class="modal-available">
					<span>📅 Til rådighed: <strong>{selectedBolig.available}</strong></span>
				</div>
			</div>
			{#if selectedBolig.link}
				<a href={selectedBolig.link} target="_blank" rel="noopener noreferrer" class="modal-cta">
					Se fuld annonce →
				</a>
			{/if}
		</div>
	</div>
{/if}

<style>
	.search-section { padding: 0; }
	.search-header { text-align: center; margin-bottom: 24px; }
	.search-header h2 { font-size: 1.6rem; font-weight: 700; color: #00bbff; margin-bottom: 6px; }
	.subtitle { color: #888; font-size: 0.9rem; }

	.search-box {
		background: #141414;
		border: 1px solid #2a2a2a;
		border-radius: 16px;
		padding: 16px;
		margin-bottom: 20px;
	}

	.search-input-row { display: flex; gap: 10px; align-items: flex-start; }
	.search-icon { font-size: 1.2rem; padding-top: 10px; flex-shrink: 0; }

	.search-input {
		flex: 1;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 10px;
		color: #e0e0e0;
		padding: 10px 14px;
		font-size: 14px;
		resize: none;
		font-family: inherit;
		transition: border-color 0.2s;
	}
	.search-input:focus { outline: none; border-color: #00bbff; }

	.search-btn {
		padding: 10px 20px;
		background: #007acc;
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 70px;
		justify-content: center;
	}
	.search-btn:hover:not(:disabled) { background: #0090e0; }
	.search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.filter-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 12px;
		padding: 8px 12px;
		background: #1a1a1a;
		border-radius: 8px;
		cursor: pointer;
		font-size: 13px;
		color: #888;
		user-select: none;
	}
	.filter-toggle:hover { color: #ccc; }

	.filters { margin-top: 12px; display: flex; flex-direction: column; gap: 14px; }
	.filter-group label { font-size: 13px; color: #aaa; display: block; margin-bottom: 6px; }
	.range-input { width: 100%; accent-color: #00bbff; }

	.loading-state { text-align: center; padding: 40px 20px; color: #888; }
	.loading-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 12px; }
	.loading-dots span {
		width: 8px; height: 8px;
		background: #00bbff;
		border-radius: 50%;
		animation: bounce 1.2s infinite;
	}
	.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
	.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

	@keyframes bounce {
		0%, 60%, 100% { transform: translateY(0); }
		30% { transform: translateY(-10px); }
	}

	.empty-state { text-align: center; padding: 40px; color: #666; }
	.empty-icon { font-size: 3rem; margin-bottom: 12px; }

	.results-header { margin-bottom: 12px; }
	.results-count { font-size: 13px; color: #888; }
	.results-grid { display: flex; flex-direction: column; gap: 12px; }

	.bolig-card {
		background: #141414;
		border: 1px solid #2a2a2a;
		border-radius: 14px;
		padding: 16px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.bolig-card:hover { border-color: #007acc; background: #181818; transform: translateY(-1px); }

	.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
	.card-type-badge {
		font-size: 11px;
		padding: 3px 10px;
		background: #1f1f1f;
		border: 1px solid #333;
		border-radius: 20px;
		color: #aaa;
	}
	.energy-badge {
		font-size: 11px;
		font-weight: 700;
		padding: 3px 8px;
		border-radius: 6px;
		color: white;
	}

	.card-title { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 4px; }
	.card-location { font-size: 13px; color: #888; margin-bottom: 8px; }
	.card-description { font-size: 13px; color: #aaa; line-height: 1.5; margin-bottom: 10px; }
	.card-meta { display: flex; gap: 14px; font-size: 12px; color: #777; margin-bottom: 12px; }
	.card-footer { display: flex; justify-content: space-between; align-items: flex-end; }
	.card-price { display: flex; align-items: baseline; gap: 4px; }
	.price-amount { font-size: 1.2rem; font-weight: 700; color: #00bbff; }
	.price-unit { font-size: 12px; color: #888; }
	.card-available { font-size: 12px; color: #888; }
	.card-link { display: inline-block; margin-top: 10px; color: #00bbff; text-decoration: none; font-size: 13px; }
	.card-link:hover { text-decoration: underline; }

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.85);
		z-index: 1000;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	.modal-content {
		background: #141414;
		border-top: 1px solid #2a2a2a;
		border-radius: 20px 20px 0 0;
		padding: 24px 20px;
		width: 100%;
		max-width: 600px;
		max-height: 85vh;
		overflow-y: auto;
		position: relative;
	}
	.modal-close {
		position: absolute;
		top: 16px;
		right: 16px;
		background: #2a2a2a;
		border: none;
		color: #aaa;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 14px;
	}
	.modal-header { margin-bottom: 16px; }
	.modal-header h2 { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
	.modal-location { font-size: 13px; color: #888; }
	.modal-stats {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 12px;
		margin-bottom: 16px;
	}
	.stat { background: #1a1a1a; border-radius: 10px; padding: 10px; text-align: center; }
	.stat-label { display: block; font-size: 11px; color: #666; margin-bottom: 4px; }
	.stat-value { font-size: 14px; font-weight: 600; color: #ddd; }
	.stat-value.primary { color: #00bbff; }
	.modal-description { font-size: 14px; color: #aaa; line-height: 1.6; margin-bottom: 12px; }
	.modal-available { font-size: 13px; color: #888; margin-bottom: 16px; }
	.modal-cta {
		display: block;
		text-align: center;
		padding: 14px;
		background: #007acc;
		color: white;
		border-radius: 12px;
		text-decoration: none;
		font-weight: 600;
		font-size: 15px;
	}
</style>
