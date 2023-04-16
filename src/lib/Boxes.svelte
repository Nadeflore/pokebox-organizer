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
		margin: 10px 0px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
