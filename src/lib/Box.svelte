<script lang="ts">
	import { start_hydrating } from 'svelte/internal';
	import type { Pokemon } from './box-order-generator/box-order-generator';
	import PokemonPicture from './PokemonPicture.svelte';
	import { checked } from './stores';
	export let box: {name: string, pokemons: Pokemon[]};
	function getTitleFromPokemon(pokemon: Pokemon) {
		let title = `${pokemon.id} ${pokemon.name['fr']}`;
		if (pokemon.region) {
			title += ` Region ${pokemon.region}`;
		}
		if (pokemon.formNames.length) {
			title += ` forms ${pokemon.formNames}`;
		}
		if (pokemon.sexes.length) {
			title += ` Sexes ${pokemon.sexes}`;
		}
		return title;
	}

	function getPokemonSignature(pokemon: Pokemon) {
		return `${pokemon.id}-${pokemon.formIds[0]}-${pokemon.sexes[0] || ''}`;
	}

	function onPokemonClicked(pokemon: Pokemon) {
		const signature = getPokemonSignature(pokemon);
		if ($checked.includes(signature)) {
			checked.set($checked.filter((s) => s !== signature));
		} else {
			checked.set([...$checked, signature]);
		}
	}
</script>

<div class="box">
	<h3>{box.name}</h3>
	<div class="box-content">
		{#each box.pokemons as pokemon (pokemon.imageName)}
			<button
				on:click={() => {
					onPokemonClicked(pokemon);
				}}
				class="pokemon"
				class:sexform={pokemon.sexForm}
				class:regionalform={pokemon.region}
				class:form={pokemon.multipleForms || pokemon.event}
				class:highlight={pokemon.matchSearch}
				class:checked={$checked.includes(getPokemonSignature(pokemon))}
			>
				<PokemonPicture {pokemon} title={getTitleFromPokemon(pokemon)} />
				<!-- <div class="name">{pokemon.name}</div> -->
			</button>
		{/each}
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
		grid-gap: 5px; /* sets the gap between the grid items */
		width: auto;
		height: auto;
	}

	.pokemon:hover,
	.pokemon:focus {
		border: 1px solid grey;
	}

	.pokemon.form {
		background-color: rgb(222, 221, 248);
	}

	.pokemon.sexform {
		background-color: rgb(224, 250, 226);
	}

	.pokemon.regionalform {
		background-color: rgb(248, 229, 221);
	}

	.pokemon.highlight {
		background-color: rgb(255, 76, 76);
	}

	:global(.pokemon.checked img) {
		opacity: 20%;
	}

	/* .pokemon .name {
		font-size: 2px;
	} */
</style>
