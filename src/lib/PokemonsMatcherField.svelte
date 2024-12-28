<script lang="ts">
	import generations from '$lib/data/generations.json';
	import pokedexes from '$lib/data/pokedexes.json';
	import Svelecte from 'svelecte';
	import { type FormData, Region } from './box-order-generator/box-order-generator';
	import { pokemonsData } from './stores';
	import { t, tl } from './i18n/i18n';

	export let placeholder: string;

	export let value: string[];

	function getFormName(form: FormData) {
        let name = "";
        if (form.region) {
            name = $t(`regionalForms.${form.region}`);
            if (form.name) {
                name += " " + $tl(form.name)
            }
        } else if (form.name) {
            name = $tl(form.name);
        } else {
            name = $t('forms.normal')
        }

        return name.trim();
    }

	$: pokemonsOptions = $pokemonsData.map((p) => ({ value: `p-${p.id}`, text: $tl(p.name) }));

	$: formsOptions = $pokemonsData.filter(p => p.forms.length > 1).flatMap((p) => p.forms.map((f) => ({ value: `f-${p.id}-${f.id}`, text: `${$tl(p.name)} - ${getFormName(f)}` })));

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
			},
			{
				value: "mega",
				text: $t('matcher.megaEvolution')
			}]
		},
		{
			groupHeader: $t('matcher.pokemon'),
			items: pokemonsOptions
		},
		{
			groupHeader: $t('matcher.form'),
			items: formsOptions
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
