<script lang="ts">
	import generations from '$lib/data/generations.json';
	import pokedexes from '$lib/data/pokedexes.json';
	import Svelecte from 'svelecte';
	import { Region } from './box-order-generator/box-order-generator';
	import { pokemonsData } from './stores';

	export let placeholder: string;

	export let value: string[];

	$: pokemonsOptions = $pokemonsData.map((p) => ({ value: `p-${p.id}`, text: p.name.fr }));

	const generationsOptions = generations.map((g) => ({
		value: `g-${g.id}`,
		text: g.name.fr
	}));

	const pokedexesOptions = pokedexes.map((dex) => ({
		value: `d-${dex.id}`,
		text: dex.name.fr
	}));
	pokedexes;
	const regionalFormsOptions = Object.values(Region).map((r) => ({
		value: `r-${r}`,
		text: `Forme de ${r}`
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
			groupHeader: 'Formes régionales',
			items: regionalFormsOptions
		},
		{
			groupHeader: 'Pokemons',
			items: pokemonsOptions
		}
	];
</script>

{#if pokemonsOptions.length}
	<Svelecte
		options={matcherOptionsGroups}
		groupLabelField="groupHeader"
		groupItemsField="items"
		bind:value
		multiple="true"
		{placeholder}
	/>
{/if}
