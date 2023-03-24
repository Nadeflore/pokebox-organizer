<script lang="ts">
	import {
		FormType,
		Region,
		type PokemonData,
		type PokemonFilterConfig
	} from './box-order-generator/box-order-generator';
	import generations from '$lib/data/generations.json';
	import pokedexes from '$lib/data/pokedexes.json';
	import PokemonsMatcherField from './PokemonsMatcherField.svelte';
	export let pokemonsData: PokemonData[];
	export let filter: PokemonFilterConfig = {
		include: [],
		exclude: [],
		sort: 'national',
		newBoxAtGenerations: [],
		forms: {
			maleFemaleForms: false,
			types: [],
			event: false,
			regions: []
		}
	};
</script>

Sort by
<select bind:value={filter.sort}>
	{#each pokedexes as pokedex}
		<option value={pokedex.id}>{pokedex.name.fr}</option>
	{/each}
</select>

<div>
	Include
	<PokemonsMatcherField
		bind:value={filter.include}
		placeholder="Pokemons to exclude"
		{pokemonsData}
	/>
</div>
<div>
	Exclude
	<PokemonsMatcherField
		bind:value={filter.exclude}
		placeholder="Pokemons to exclude"
		{pokemonsData}
	/>
</div>
<div>
	New box at generation
	{#each generations as generation}
		<label>
			<input
				type="checkbox"
				bind:group={filter.newBoxAtGenerations}
				name="newBoxGenerations"
				value={generation}
			/>
			{generation.name.fr}
		</label>
	{/each}
</div>

<label>
	<input type="checkbox" bind:checked={filter.forms.maleFemaleForms} />
	Male and female forms
</label>
<label>
	<input type="checkbox" bind:checked={filter.forms.event} />
	Event forms
</label>
{#each Object.values(FormType) as type}
	<label>
		<input type="checkbox" bind:group={filter.forms.types} name="types" value={type} />
		{type}
	</label>
{/each}
{#each Object.values(Region) as region}
	<label>
		<input type="checkbox" bind:group={filter.forms.regions} name="region" value={region} />
		{region}
	</label>
{/each}
