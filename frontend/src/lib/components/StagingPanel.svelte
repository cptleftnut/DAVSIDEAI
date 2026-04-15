<script lang="ts">
	import { invoke } from '../tauri-mock';

	let prompt = $state('Lys moderne lejlighed med grønne planter, hvid sofa og naturligt lys');
	let stagingUrl = $state<string | null>(null);
	let isLoading = $state(false);
	let activeStyle = $state('Moderne');

	const styles = [
		{ name: 'Moderne', prompt: 'Lys moderne lejlighed med minimalistisk design, hvide vægge og naturligt lys' },
		{ name: 'Skandinavisk', prompt: 'Skandinavisk interiør med træ, hvide toner, planter og hyggeligt lys' },
		{ name: 'Industriel', prompt: 'Industriel stil med betonvægge, metal og varmt lys' },
		{ name: 'Klassisk', prompt: 'Klassisk dansk interiør med mørkt træ, elegante møbler og varme farver' },
		{ name: 'Luksus', prompt: 'Luksuriøst penthouse med marmor, guld detaljer og panoramaudsigt' },
	];

	function selectStyle(style: typeof styles[0]) {
		activeStyle = style.name;
		prompt = style.prompt;
	}

	async function generate() {
		if (!prompt.trim()) return;
		isLoading = true;
		stagingUrl = null;
		try {
			const url = await invoke<string>('generate_staging', {
				req: { prompt, base_image: null, mode: 'image' }
			});
			stagingUrl = url;
		} catch (e) {
			console.error('Fejl ved generering:', e);
		}
		isLoading = false;
	}
</script>

<div class="staging-panel">
	<div class="panel-header">
		<h3>Virtual Staging</h3>
		<span class="badge">AI</span>
	</div>
	<p class="panel-desc">Visualisér din bolig med AI-genererede interiørbilleder</p>

	<div class="style-grid">
		{#each styles as style}
			<button
				class="style-btn {activeStyle === style.name ? 'active' : ''}"
				onclick={() => selectStyle(style)}
			>
				{style.name}
			</button>
		{/each}
	</div>

	<div class="prompt-area">
		<label>Beskriv ønsket stil</label>
		<textarea
			bind:value={prompt}
			rows="3"
			placeholder="F.eks. 'Moderne lejlighed med planter og hvid sofa...'"
		></textarea>
	</div>

	<button class="generate-btn" onclick={generate} disabled={isLoading || !prompt.trim()}>
		{#if isLoading}
			<span class="spinner"></span>
			<span>Genererer billede...</span>
		{:else}
			<span>📷</span>
			<span>Generer staging-billede</span>
		{/if}
	</button>

	{#if stagingUrl}
		<div class="result animate-in">
			<img src={stagingUrl} alt="Virtual staging" class="staging-img" />
			<a href={stagingUrl} target="_blank" rel="noopener noreferrer" class="download-btn">
				⬇️ Åbn i fuld størrelse
			</a>
		</div>
	{/if}

	{#if isLoading}
		<div class="loading-placeholder">
			<div class="loading-shimmer"></div>
			<p>Grok Imagine genererer dit billede...</p>
		</div>
	{/if}
</div>

<style>
	.staging-panel {
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
		background: linear-gradient(135deg, #007acc, #00bbff);
		border-radius: 20px;
		color: white;
	}

	.panel-desc { font-size: 13px; color: #888; margin-bottom: 16px; }

	.style-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 16px;
	}

	.style-btn {
		padding: 6px 14px;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 20px;
		color: #aaa;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.style-btn.active { background: #007acc; border-color: #007acc; color: white; }
	.style-btn:hover:not(.active) { border-color: #555; color: #ddd; }

	.prompt-area { margin-bottom: 14px; }
	.prompt-area label { font-size: 12px; color: #888; display: block; margin-bottom: 6px; }

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
	textarea:focus { outline: none; border-color: #00bbff; }

	.generate-btn {
		width: 100%;
		padding: 14px;
		background: linear-gradient(135deg, #007acc, #00bbff);
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
	.generate-btn:hover:not(:disabled) { opacity: 0.9; }
	.generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.result { margin-top: 16px; }
	.staging-img {
		width: 100%;
		border-radius: 12px;
		display: block;
		margin-bottom: 10px;
	}
	.download-btn {
		display: block;
		text-align: center;
		padding: 10px;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 10px;
		color: #aaa;
		text-decoration: none;
		font-size: 13px;
	}
	.download-btn:hover { border-color: #555; color: #ddd; }

	.loading-placeholder {
		margin-top: 16px;
		text-align: center;
	}
	.loading-shimmer {
		width: 100%;
		height: 200px;
		background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
		background-size: 200% 100%;
		border-radius: 12px;
		animation: shimmer 1.5s infinite;
		margin-bottom: 10px;
	}
	@keyframes shimmer {
		0% { background-position: -200% 0; }
		100% { background-position: 200% 0; }
	}
	.loading-placeholder p { font-size: 13px; color: #666; }
</style>
