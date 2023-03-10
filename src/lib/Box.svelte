<script>
	import PokemonPicture from './PokemonPicture.svelte';
	/**
	 * @type {import("./box-order-generator/box-order-generator").Pokemon[]}
	 */
	export let box;
	/**
	 * @type {number}
	 */
	export let boxNumber;
	/**
	 * @param {import("./box-order-generator/box-order-generator").Pokemon} pokemon
	 */
	function getTitleFromPokemon(pokemon) {
		return `${pokemon.id} ${pokemon.name} Region ${pokemon.region} forms ${pokemon.formIds} Sexes ${pokemon.sexes}`;
	}
</script>

<div class="box">
	<h3>Boite {boxNumber}</h3>
	<div class="box-content">
		{#each box as pokemon}
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
