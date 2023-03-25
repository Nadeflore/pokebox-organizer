<script lang="ts">
	import {
		getPokemonBoxes,
		type Pokemon,
		type PokemonFilterConfig
	} from './box-order-generator/box-order-generator';
	import Box from './Box.svelte';
	import { pokemonsData } from './stores';
	export let config: PokemonFilterConfig;
	export let search: string[];
	$: boxes = getPokemonBoxes($pokemonsData, config, search);
</script>

<div class="boxes">
	{#each boxes as box, i}
		<Box {box} boxNumber={i + 11} />
	{/each}
</div>

<style>
	.boxes {
		display: flex;
		flex-wrap: wrap;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
