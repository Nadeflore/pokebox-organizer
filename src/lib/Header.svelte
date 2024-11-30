<script lang="ts">
	import Button from './Button.svelte';
	import PokemonsMatcherField from './PokemonsMatcherField.svelte';
	import { checked } from './stores';

	export let search: string[];
	export let settingsPanelOpen: boolean;
	export let checkMode: boolean;
</script>

<div class="header">
	<div class="search">
		<PokemonsMatcherField bind:value={search} placeholder="Search" />
	</div>
	<div class="controls">
		<Button on:click={() => (checkMode = !checkMode)}>Check Mode {checkMode ? "On" :"Off"}</Button>

		<Button on:click={() => (confirm('Clear all checked ?') ? checked.set([]) : null)}>Clear</Button
		>
		<Button on:click={() => (settingsPanelOpen = !settingsPanelOpen)}>Settings</Button>
	</div>
</div>

<style>
	.header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		background-color: white;
		padding: 10px;
	}

	.search {
		width: 100%;
		max-width: 400px;
	}

	.controls {
		height: 38px;
	}

	.controls {
		display: flex;
		flex-wrap: nowrap;
	}
</style>
