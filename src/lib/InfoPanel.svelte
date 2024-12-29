<script lang="ts">
    import { onMount } from 'svelte';
	import { type SexedForm, type Pokemon, Sex, getPokemonSignature, type FormData, type PokemonData, UndepositableType, type LocalizedName } from "./box-order-generator/box-order-generator";
	import PokemonPicture from "./PokemonPicture.svelte";
	import { t, tl } from './i18n/i18n';
	import { infoPanelPokemon, notes } from './stores';

    export let pokemon: Pokemon;

    let infoPanel: HTMLElement | undefined;
    let noteInput: HTMLElement;

	onMount(() => {
        if (infoPanel) {
		    infoPanel.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
        onNoteInput();
	});

    function onNoteInput() {
        // Resize to fit the text
        noteInput.style.height = '1px';
        noteInput.style.height = `${noteInput.scrollHeight}px`;
    }

    function getSexedFormName(sexedForm: SexedForm) {
        let name = getFormName(sexedForm.form, {}, sexedForm.form.sex == "fd" ? sexedForm.sex : undefined);

        if (sexedForm.subFormId !== undefined && pokemon.pokemonData.subForms) {
            name += " " + $tl(pokemon.pokemonData.subForms[sexedForm.subFormId].name)
        }

        return name.trim();
    }

	function getFormName(form: FormData, pokemonName: LocalizedName, sex = undefined as Sex | undefined) {
        let nameParts = [];

        if (form.region) {
            nameParts.push($t(`regionalForms.${form.region}`));
        }

        if (form.undepositable == UndepositableType.MEGA) {
            nameParts.push($t('forms.mega', {name: $tl(pokemonName)}));
        }

        if (form.name) {
            nameParts.push($tl(form.name));
        }

        if (sex) {
            switch(sex) {
                case Sex.M:
                    nameParts.push($t('forms.male'));
                    break;
                case Sex.F:
                    nameParts.push($t('forms.female'));
                    break;
                default:
                    throw new Error(`Unexpected sex for double form : ${sex}`)
            }
        }

        // Default when no name exists
        if (nameParts.length == 0) {
            nameParts.push($t('forms.normal'));
        }

        return nameParts.join(" ");
    }

    function getGigantamaxName(form: FormData, addFormName: boolean) {
        let name = $t('forms.gigantamax');
        if (form.name && addFormName) {
            name += " " + $tl(form.name);
        }
        return name;
    }

    function getGigantamaxForms(pokemon: Pokemon) {
        let gigantamaxForms = pokemon.sexedForms.map(f => f.form).filter(f => f.gigantamax).filter((v, i, a) => a.indexOf(v) === i);
        if (pokemon.pokemonData.id == 869) {
            // Special case for Alcremie, only one gigamax of any form is required
            return [gigantamaxForms[0]];
        }
        return gigantamaxForms;
    }

    const gigantamaxForms = getGigantamaxForms(pokemon);

</script>

<div class="info-panel" bind:this={infoPanel} on:click|stopPropagation={()=>{}} on:keydown={()=>{}}>
    <button class="close" on:click={() => {$infoPanelPokemon = null}}>&#x2715;</button>
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
    <div class="note">
        <div class="title">Note</div>
        <textarea bind:value={$notes[getPokemonSignature(pokemon)]} on:input={onNoteInput} bind:this={noteInput} rows="1" ></textarea>
    </div>
    {#each pokemon.sexedForms as sexedForm}
        <div class="form">
            <div class="picture">
                <PokemonPicture {pokemon} title={`Form id ${sexedForm.form.id}`} sexedForm={sexedForm}></PokemonPicture>
            </div>
            <div class="form-name">
                {getSexedFormName(sexedForm)}
            </div>
        </div>
    {/each}

    {#if pokemon.undepositableForms.length || gigantamaxForms.length}
        <h3>{$t('forms.undepositable')} </h3>
        {#each pokemon.undepositableForms as form, i}
            <div class="form">
                <div class="picture">
                    <PokemonPicture {pokemon} title={`Form id ${form.id}`} {form}></PokemonPicture>
                </div>
                <div class="form-name">
                    {getFormName(form, pokemon.pokemonData.name)}
                </div>
            </div>
        {/each}
        {#each gigantamaxForms as form, i}
            <div class="form">
                <div class="picture">
                    <PokemonPicture {pokemon} title={`Form id ${form.id}`} {form} gigantamax></PokemonPicture>
                </div>
                <div class="form-name">
                    {getGigantamaxName(form, pokemon.pokemonData.id != 869)}
                    <div class="form-details">
                        {$t('forms.requireGigantamax', {name: $tl(pokemon.pokemonData.name)})}
                    </div>
                </div>
        
            </div>
        {/each}
    {/if}


</div>

<style>
    .info-panel {
        background-color: rgb(246, 241, 241);
        margin: 1em;
        box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.5);
        position: relative;
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


    .note {
            display: flex;
            margin: 0.5em;
    }

    .note .title {
        margin-top: 0.25em;
        margin-right: 0.5em;
    }

    .note textarea {
        flex: 1;
        resize: none;
    }

    h3 {
        padding: 1em;
        background-color: rgb(239, 255, 242);

    }

    .form-details {
        font-size: 0.7em;
        padding-top: 0.5em;
    }

    .close {
        position: absolute;
        padding: 1em;
        top: 0;
        right: 0;
    }
</style>