<script lang="ts">
	import generations from '$lib/data/generations.json';
	import pokedexes from '$lib/data/pokedexes.json';
	import Svelecte from 'svelecte';
	import type { PokemonData, PokemonMatcher } from './box-order-generator/box-order-generator';

	export let pokemonsData: PokemonData[];
	export let placeholder: string;

	export let value: PokemonMatcher[] = [];

	$: pokemonsOptions = pokemonsData.map((p) => ({ value: { id: p.id }, text: p.name.fr }));

	const generationsOptions = generations.map((g) => ({
		value: { generation: g },
		text: g.name.fr
	}));

	const pokedexesOptions = pokedexes.map((p) => ({
		value: { pokedex: p.id },
		text: p.name.fr
	}));

	$: matcherOptionsGroups = [
		{
			groupHeader: 'Générations',
			items: generationsOptions
		},
		{
			groupHeader: 'Pokedexes',
			items: pokedexesOptions
		},
		{
			groupHeader: 'Pokemons',
			items: pokemonsOptions
		}
	];
</script>

<Svelecte
	options={matcherOptionsGroups}
	groupLabelField="groupHeader"
	groupItemsField="items"
	bind:value
	multiple="true"
	{placeholder}
/>
