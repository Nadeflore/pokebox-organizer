<script>
	import Box from './Box.svelte';
	import { getPokemonBoxes, FormType } from './box-order-generator/box-order-generator';

	let maleFemaleForms = true;
	let event = false;
	/**
	 * @type {FormType[]}
	 */
	let types = [FormType.NORMAL, FormType.SEX, FormType.CHANGE];

	$: boxes = getPokemonBoxes(maleFemaleForms, event, types);
</script>

<div class="header">
	<label>
		<input type="checkbox" bind:checked={maleFemaleForms} />
		Male and female forms
	</label>
	<label>
		<input type="checkbox" bind:checked={event} />
		Event forms
	</label>

	{#each Object.values(FormType) as type}
		<label>
			<input type="checkbox" bind:group={types} name="flavours" value={type} />
			{type}
		</label>
	{/each}
</div>

<div class="storage">
	{#each boxes as box, i}
		<Box {box} boxNumber={i + 11} />
	{/each}
</div>

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
