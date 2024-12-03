<script lang="ts">
    import { onMount } from 'svelte';
	import { type SexedForm, type Pokemon, Sex } from "./box-order-generator/box-order-generator";
	import PokemonPicture from "./PokemonPicture.svelte";
	import { t, tl } from './i18n/i18n';

    export let pokemon: Pokemon;

    let infoPanel: HTMLElement | undefined;

	onMount(() => {
        if (infoPanel) {
		    infoPanel.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
	});

    function getFormName(sexedForm: SexedForm) {
        let name = "";
        // First generate the base name depending on the region and specified form name

        if (sexedForm.form.region) {
            name = $t(`regionalForms.${sexedForm.form.region}`);
            if (sexedForm.form.name) {
                name += " " + $tl(sexedForm.form.name)
            }
        } else if (sexedForm.form.name) {
            name = $tl(sexedForm.form.name);
        } else if(sexedForm.form.sex != "fd"){
            name = $t('forms.normal')
        }

        if (sexedForm.form.sex == "fd") {
            switch(sexedForm.sex) {
                case Sex.M:
                    name += " " + $t('forms.male');
                    break;
                case Sex.F:
                    name += " " + $t('forms.female');
                    break;
                default:
                    throw new Error(`Unexpected sex for double form : ${sexedForm.sex}`)
            }
        }

        if (sexedForm.subFormId !== undefined && pokemon.pokemonData.subForms) {
            name += " " + $tl(pokemon.pokemonData.subForms[sexedForm.subFormId].name)
        }

        return name.trim();
    }
</script>

<div class="info-panel" bind:this={infoPanel}>
    <div class="header">
        {#if pokemon.dexNumber}
            <div class="dex-number regional">
                <div class="title">{$t('pokedex.regional')}</div>
                N°{pokemon.dexNumber}
            </div>
        {/if}
        <div class="dex-number national">
            <div class="title">{$t('pokedex.national')}</div>
            N°{pokemon.pokemonData.id}
        </div>
        <div class="pokemon-name">{$tl(pokemon.pokemonData.name)}</div>
    </div>
    {#each pokemon.sexedForms as sexedForm, i}
        <div class="form">
            <div class="picture">
                <PokemonPicture {pokemon} title={`Form id ${sexedForm.form.id}`} formIndex={i}></PokemonPicture>
            </div>
            <div class="form-name">
                {getFormName(sexedForm)}
            </div>
        </div>
    {/each}
</div>

<style>
    .info-panel {
        background-color: rgb(246, 241, 241);
        margin: 1em;
        box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.5);    
    }

    .header {
        display: flex;
        background-color: rgb(239, 255, 242);
        box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.3);    
    }
    
    .dex-number {
        padding: 0.5em;
        text-align: center;
    }

    .dex-number .title {
        font-size: 0.5em;
    }
    
    .dex-number.regional {
        background-color: rgb(249, 223, 223);
    }

    .dex-number.national {
        background-color: rgb(248, 214, 242);
    }

    .pokemon-name {
        background-color: rgb(239, 255, 242);
        padding: 1em;
    }

    .form {
        display: flex;
        align-items: center;
    }

    .picture {
        width: 7em;
    }




</style>