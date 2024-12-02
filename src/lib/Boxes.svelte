<script lang="ts">
	import {
		getPokemonBoxes,
	} from './box-order-generator/box-order-generator';
	import Box from './Box.svelte';
	import { config, pokemonsData } from './stores';
	export let search: string[];
	export let checkMode: boolean;
	$: boxes = getPokemonBoxes($pokemonsData, $config, search);
</script>

<div class="boxes">
	{#each boxes as box}
		<Box {box} {checkMode}/>
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
