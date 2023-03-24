<script lang="ts">
	import {
		getPokemonBoxes,
		type PokemonFilterConfig
	} from '$lib/box-order-generator/box-order-generator';
	import Boxes from '$lib/Boxes.svelte';
	import FilterPanel from '$lib/FilterPanel.svelte';
	export let data;

	let filter: PokemonFilterConfig;
	$: boxes = getPokemonBoxes(data.pokemons, filter);
</script>

<div class="header">
	<FilterPanel pokemonsData={data.pokemons} bind:filter />
</div>

<Boxes {boxes} />

<style>
	.header {
		background-color: white;
		padding: 10px;
		position: sticky;
		top: 0;
		z-index: 999;
	}
	.storage {
		display: flex;
		flex-wrap: wrap;
		font-family: Arial, Helvetica, sans-serif;
	}

	:global(body) {
		margin: 0px;
	}
</style>
