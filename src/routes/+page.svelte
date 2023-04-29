<script lang="ts">
	import { pokemonsData, config, checked, state } from '$lib/stores';
	import Boxes from '$lib/Boxes.svelte';
	import PokemonsMatcherField from '$lib/PokemonsMatcherField.svelte';
	import SettingsPanel from '$lib/SettingsPanel.svelte';
	import Header from '$lib/Header.svelte';
	import Tabs from '$lib/Tabs.svelte';
	export let data;
	$: pokemonsData.set(data.pokemonsData);

	let search: string[] = [];
	let settingsPanelOpen = false;
</script>

<div class="page" class:panel-open={settingsPanelOpen}>
	<div class="header">
		<Header bind:search bind:settingsPanelOpen />
	</div>
	<div class="content">
		<Boxes config={$config} {search} />
	</div>
	<div class="panel" class:closed={!settingsPanelOpen}>
		<SettingsPanel />
	</div>
	<div class="tabs">
		<Tabs />
	</div>
</div>

<style>
	@media only screen and (max-width: 800px) {
		.page.panel-open {
			grid-template-columns: 0 1fr;
		}
	}
	.page {
		height: 100%;
		display: grid;
		grid:
			'header header' auto
			'content panel' 1fr
			'tabs tabs' auto
			/ 1fr auto;
	}

	.header {
		grid-area: header;
		box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.5);
		z-index: 10;
	}
	.content {
		grid-area: content;
		overflow-y: auto;
	}

	.panel {
		grid-area: panel;
		overflow-y: auto;
		box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.5);
	}

	.panel.closed {
		display: none;
	}

	.tabs {
		grid-area: tabs;
		box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.5);
		z-index: 10;
	}

	:global(html) {
		height: 100%;
	}
	:global(body) {
		margin: 0px;
		height: 100%;
		font-family: Arial, Helvetica, sans-serif;
	}

	:global(button) {
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;
	}

	:global(ul) {
		list-style-type: none;
		margin: 0;
		padding: 0;
	}
</style>
