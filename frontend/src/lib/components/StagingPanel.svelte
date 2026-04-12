<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';

	export let prompt = "";
	let stagingUrl = $state<string | null>(null);
	let videoUrl = $state<string | null>(null);
	let isLoading = $state(false);

	async function generate(mode: "image" | "video") {
		isLoading = true;
		try {
			const url = await invoke<string>('generate_staging', {
				req: { prompt, base_image: null, mode }
			});
			if (mode === "image") stagingUrl = url;
			else videoUrl = url;
		} catch (e) {
			alert(`Fejl ved ${mode}-generering: ${e}`);
		}
		isLoading = false;
	}
</script>

<div class="staging-panel">
	<h3>Virtual Staging med Grok Imagine</h3>
	<textarea bind:value={prompt} rows="3" placeholder="Beskriv ønsket stil..."></textarea>

	<div class="actions">
		<button on:click={() => generate("image")} disabled={isLoading}>
			{isLoading ? "Genererer..." : "📷 Billede"}
		</button>
		<button on:click={() => generate("video")} disabled={isLoading}>
			{isLoading ? "Genererer..." : "🎬 Video"}
		</button>
	</div>

	{#if stagingUrl}
		<img src={stagingUrl} alt="Staged billede" class="media" />
	{/if}
	{#if videoUrl}
		<!-- svelte-ignore a11y-media-has-caption -->
		<video controls class="media" src={videoUrl}></video>
	{/if}
</div>

<style>
	.staging-panel {
		background: #1a1a1a;
		padding: 20px;
		border-radius: 12px;
		margin: 20px 0;
	}
	h3 { margin: 0 0 12px; color: #00bbff; }
	textarea {
		width: 100%;
		background: #252526;
		border: 1px solid #555;
		border-radius: 8px;
		color: #ddd;
		padding: 12px;
		resize: vertical;
		box-sizing: border-box;
	}
	.actions { display: flex; gap: 12px; margin-top: 12px; }
	button {
		flex: 1;
		padding: 14px;
		background: #007acc;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 15px;
	}
	button:disabled { opacity: 0.5; cursor: not-allowed; }
	.media { width: 100%; border-radius: 10px; margin-top: 16px; }
</style>
