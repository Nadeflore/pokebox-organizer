<script lang="ts">
	import generations from '$lib/data/generations.json';
	import pokedexes from '$lib/data/pokedexes.json';
	import Svelecte from 'svelecte';
	import { Region } from './box-order-generator/box-order-generator';
	import { pokemonsData } from './stores';
	import { t, tl } from './i18n/i18n';

	export let placeholder: string;

	export let value: string[];

	$: pokemonsOptions = $pokemonsData.map((p) => ({ value: `p-${p.id}`, text: $tl(p.name) }));

	$: generationsOptions = generations.map((g) => ({
		value: `g-${g.id}`,
		text: $tl(g.name)
	}));

	$: pokedexesOptions = pokedexes.map((dex) => ({
		value: `d-${dex.id}`,
		text: $tl(dex.name)
	}));
	
	$: regionalFormsOptions = Object.values(Region).map((r) => ({
		value: `r-${r}`,
		text: $t(`regionalForms.${r}`)
	}));

	$: matcherOptionsGroups = [
		{
			groupHeader: $t('matcher.generation'),
			items: generationsOptions
		},
		{
			groupHeader: $t('pokedex.title'),
			items: pokedexesOptions
		},
		{
			groupHeader: $t('regionalForms.title'),
			items: regionalFormsOptions
		},
		{
			groupHeader: $t('matcher.characteristic'),
			items: [{
				value: "gigantamax",
				text: $t('matcher.gigantamax')
			}]
		},
		{
			groupHeader: $t('matcher.pokemon'),
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
