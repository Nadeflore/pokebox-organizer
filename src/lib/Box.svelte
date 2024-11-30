<script lang="ts">
	import { Group, Sex, type Pokemon } from './box-order-generator/box-order-generator';
	import InfoPanel from './InfoPanel.svelte';
	import PokemonPicture from './PokemonPicture.svelte';
	import { checked } from './stores';
	export let box: {name: string, pokemons: Pokemon[]};
	export let checkMode: boolean;

	function getPokemonSignature(pokemon: Pokemon) {
		const firstForm = pokemon.sexedForms[0];
		const sex = firstForm.sex && firstForm.sex != Sex.MF ? firstForm.sex : firstForm.form.sex == "mf" ? Sex.M: "";
		return `${pokemon.pokemonData.id}-${firstForm.form.id}-${sex}`;
	}

	function isMale(pokemon: Pokemon) {
		return pokemon.sexedForms.map(sf => sf.sex).every(s => s == Sex.M);
	}

	function isFemale(pokemon: Pokemon) {
		return pokemon.sexedForms.map(sf => sf.sex).every(s => s == Sex.F);
	}

	function isMaleFemale(pokemon: Pokemon) {
		const sexes = pokemon.sexedForms.map(sf => sf.sex)
		return (sexes.some(s => s == Sex.F) && sexes.some(s => s == Sex.M)) || sexes.some(s => s == Sex.MF);
	}

	function onPokemonClicked(pokemon: Pokemon, index: number) {
		if (checkMode) {
			const signature = getPokemonSignature(pokemon);
			if ($checked.includes(signature)) {
				checked.set($checked.filter((s) => s !== signature));
			} else {
				checked.set([...$checked, signature]);
			}
		} else {
			infoPanelPokemon = pokemon;
			infoPanelPokemonIndex = index;
		}
	}

	let infoPanelPokemon: Pokemon | null = null;
	let infoPanelPokemonIndex = 0;
</script>

<div class="box" class:check-mode={checkMode} on:mouseleave={() => {infoPanelPokemon = null}}>
	<h3>{box.name}</h3>
	<div class="box-content">
		{#each box.pokemons as pokemon, i (getPokemonSignature(pokemon))}
			<button
				on:click={() => {
					onPokemonClicked(pokemon, i);
				}}
				class="pokemon"
				class:highlight={pokemon.matchSearch}
				class:checked={$checked.includes(getPokemonSignature(pokemon))}
				class:first={pokemon.group == Group.FIRST}
				class:middle={pokemon.group == Group.MIDDLE}
				class:last={pokemon.group == Group.LAST}
				class:male={isMale(pokemon)}
				class:female={isFemale(pokemon)}
				class:male-female={isMaleFemale(pokemon)}
			>
				<div class="groupbar" style="--bar-color: rgb(145, 225, 203)"></div>
				<div class="check"></div>
				<div class="sex"></div>
				{#if pokemon.sexedForms.length > 1}
					<div class="multiple-forms">{pokemon.sexedForms.length}</div>
				{/if}
				<PokemonPicture {pokemon} title={pokemon.pokemonData.name.fr || ""} />
			</button>
		{/each}
		{#if infoPanelPokemon}
		<div class="details-panel" style="top: {(Math.floor(infoPanelPokemonIndex / 6) + 1) * 20}%">
		<InfoPanel pokemon={infoPanelPokemon}/></div>
		{/if}
	</div>
</div>

<style>
	.box {
		margin: 10px;
		background-color: rgb(248, 246, 246);
		max-width: 400px;
	}
	.box h3 {
		text-align: center;
	}

	.box-content {
		display: grid;
		grid-template-rows: repeat(5, 1fr); /* creates 5 rows */
		grid-template-columns: repeat(6, 1fr); /* creates 6 columns */
		width: auto;
		height: auto;
		position: relative;
	}

	.details-panel {
		position: absolute;
		width: 100%;
		z-index: 10;
	}

	.pokemon {
		position: relative;
		overflow: hidden;
	}
	.pokemon .groupbar {
		position: absolute;
		bottom: 0;
		height: 5%;
		width: 100%;
	}

	.pokemon .groupbar {
		position: absolute;
		bottom: 0;
		height: 5%;
		width: 100%;
	}

	.pokemon.first .groupbar {
		left: 20%;
		border-left: 2px solid var(--bar-color);
		border-bottom: 2px solid var(--bar-color);
	}

	.pokemon.middle .groupbar {
		border-bottom: 2px solid var(--bar-color);
	}

	.pokemon.last .groupbar {
		right: 20%;
		border-right: 2px solid var(--bar-color);
		border-bottom: 2px solid var(--bar-color);
	}


	.pokemon:hover,
	.pokemon:focus {
		border: 1px solid grey;
	}

	.pokemon.highlight {
		background-color: rgb(255, 76, 76);
	}

	:global(.check-mode .pokemon img) {
		opacity: 70%;
	}
	.pokemon .check {
		position: absolute;
		top: 5%;
		right: 5%;
		width: 20%;
		height: 20%;
	}

	.box:not(.check-mode) .pokemon.checked .check {
		background-image: url("images/checkmark.svg");
	}

	.box.check-mode .pokemon.checked {
		background-image: url("images/checkmark.svg");
	}
	.box.check-mode .pokemon:not(.checked) {
		background-image: url("images/crossmark.svg");
	}

	.pokemon .sex {
		position: absolute;
		bottom: 6%;
		left: 6%;
		width: 17%;
		height: 17%;
	}

	.pokemon.male .sex {
		background-image: url("images/maleicon.svg");
	}

	.pokemon.female .sex {
		background-image: url("images/femaleicon.svg");
	}

	.pokemon .multiple-forms {
		background-image: url("images/multipleformsicon.svg");
		position: absolute;
		bottom: 6%;
		right: 6%;
		width: 17%;
		height: 17%;
		color: white;
		font-size: 60%;
		font-weight: bold;
	}

	</style>
