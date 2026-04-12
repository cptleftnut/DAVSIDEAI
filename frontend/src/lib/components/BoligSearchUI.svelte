<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';

	let query = $state("København N, 2-værelses, max 14000 kr");
	let results = $state<any[]>([]);
	let isSearching = $state(false);

	async function search() {
		isSearching = true;
		try {
			const res = await invoke<any[]>('search_boliger', {
				req: { query, min_price: 0, max_price: 999999, min_size: 0 }
			});
			results = res;
		} catch (e) {
			alert("Søgefejl: " + e);
		}
		isSearching = false;
	}
</script>

<div class="bolig-search">
	<h2>Find din næste bolig</h2>
	<textarea bind:value={query} rows="3" placeholder="Søg f.eks. 'Østerbro 2-værelses max 14000'"></textarea>

	<button on:click={search} disabled={isSearching}>
		{isSearching ? "Søger..." : "🔍 Søg boliger"}
	</button>

	<div class="results">
		{#each results as bolig}
			<div class="bolig-card">
				<h3>{bolig.title}</h3>
				<p class="location">📍 {bolig.location}</p>
				<p class="price"><strong>{bolig.price.toLocaleString('da-DK')} kr/måned</strong> • {bolig.size} m²</p>
				{#if bolig.link}
					<a href={bolig.link} target="_blank" rel="noopener noreferrer">Se annonce →</a>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.bolig-search { margin: 20px 0; }
	h2 { color: #00bbff; margin-bottom: 12px; }
	textarea {
		width: 100%;
		background: #1a1a1a;
		border: 1px solid #444;
		border-radius: 8px;
		color: #ddd;
		padding: 12px;
		margin-bottom: 12px;
		resize: vertical;
		box-sizing: border-box;
	}
	button {
		width: 100%;
		padding: 16px;
		background: #007acc;
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 16px;
		cursor: pointer;
		margin-bottom: 16px;
	}
	button:disabled { opacity: 0.5; cursor: not-allowed; }
	.bolig-card {
		background: #1a1a1a;
		border: 1px solid #333;
		padding: 16px;
		border-radius: 12px;
		margin-bottom: 12px;
	}
	.bolig-card h3 { margin: 0 0 6px; color: #fff; }
	.location { color: #aaa; margin: 4px 0; font-size: 14px; }
	.price { color: #ddd; margin: 4px 0; }
	a { color: #00bbff; text-decoration: none; font-size: 14px; }
	a:hover { text-decoration: underline; }
</style>
