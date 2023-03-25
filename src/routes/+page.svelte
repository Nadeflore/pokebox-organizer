<script lang="ts">
	import { pokemonsData, config, checked } from '$lib/stores';
	import Boxes from '$lib/Boxes.svelte';
	import PokemonsMatcherField from '$lib/PokemonsMatcherField.svelte';
	import SettingsPanel from '$lib/SettingsPanel.svelte';
	export let data;
	$: pokemonsData.set(data.pokemonsData);

	let search: string[] = [];
	let settingsPanelOpen = false;
</script>

<div class="page" class:panel-open={settingsPanelOpen}>
	<div class="content">
		<div class="header">
			<div class="search">
				<PokemonsMatcherField bind:value={search} placeholder="Search" />
			</div>
			<div class="controls">
				<button on:click={() => checked.set([])}>Uncheck all</button>
				<button on:click={() => (settingsPanelOpen = !settingsPanelOpen)}>Settings</button>
			</div>
		</div>
		<div class="pc-boxes">
			<Boxes config={$config} {search} />
		</div>
	</div>
	<SettingsPanel bind:open={settingsPanelOpen} />
</div>

<style>
	@media only screen and (max-width: 800px) {
		.page.panel-open .content {
			display: none;
		}
	}
	.page {
		height: 100vh;
		display: flex;
	}
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.pc-boxes {
		overflow-y: auto;
	}

	.header {
		display: flex;
		justify-content: space-between;
		background-color: white;
		padding: 10px;
	}

	.search {
		min-width: 300px;
	}

	:global(body) {
		margin: 0px;
		height: 100%;
	}
</style>
