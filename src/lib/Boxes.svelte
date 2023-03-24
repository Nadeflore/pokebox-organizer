<script lang="ts">
	import type { Pokemon } from './box-order-generator/box-order-generator';
	import Box from './Box.svelte';
	export let boxes: Pokemon[][];
</script>

<div class="storage">
	{#each boxes as box, i}
		<Box {box} boxNumber={i + 11} />
	{/each}
</div>

<style>
	.storage {
		display: flex;
		flex-wrap: wrap;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
