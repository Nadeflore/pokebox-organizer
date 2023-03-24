<script lang="ts">
	import type { Pokemon } from './box-order-generator/box-order-generator';
	import PokemonPicture from './PokemonPicture.svelte';
	export let box: Pokemon[];
	export let boxNumber: number;
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
</script>

<div class="box">
	<h3>Boite {boxNumber}</h3>
	<div class="box-content">
		{#each box as pokemon (pokemon.imageName)}
			<div
				class="pokemon"
				class:sexform={pokemon.sexForm}
				class:regionalform={pokemon.region}
				class:form={pokemon.multipleForms || pokemon.event}
			>
				<PokemonPicture {pokemon} title={getTitleFromPokemon(pokemon)} />
				<!-- <div class="name">{pokemon.name}</div> -->
			</div>
		{/each}
	</div>
</div>

<style>
	.box {
		margin: 20px;
		background-color: rgb(248, 246, 246);
	}
	.box h3 {
		text-align: center;
	}

	.box-content {
		display: grid;
		grid-template-rows: repeat(5, 1fr); /* creates 5 rows */
		grid-template-columns: repeat(6, 1fr); /* creates 6 columns */
		grid-gap: 10px; /* sets the gap between the grid items */
		width: auto;
	}

	.pokemon {
		padding: 5px;
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

	/* .pokemon .name {
		font-size: 2px;
	} */
</style>
