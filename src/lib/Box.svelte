<script lang="ts">
	import { GenderFormsType, getPokemonSignature, Group, Sex, type Pokemon } from './box-order-generator/box-order-generator';
	import { t, tl } from './i18n/i18n';
	import InfoPanel from './InfoPanel.svelte';
	import PokemonPicture from './PokemonPicture.svelte';
	import { checked, config, infoPanelPokemon } from './stores';
	export let box: {name: string, namePrefix: string | undefined, pokemons: Pokemon[]};
	export let checkMode: boolean;

	function isMale(pokemon: Pokemon) {
		return pokemon.sexedForms.map(sf => sf.sex).every(s => s == Sex.M);
	}

	function isFemale(pokemon: Pokemon) {
		return pokemon.sexedForms.map(sf => sf.sex).every(s => s == Sex.F);
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
			$infoPanelPokemon = pokemon;
			infoPanelPokemonIndex = index;
			document.body.addEventListener('click', closeInfoPanel)
		}
	}

	function closeInfoPanel() {
		$infoPanelPokemon = null;
		document.body.removeEventListener('click', closeInfoPanel)
	}

	let infoPanelPokemonIndex = 0;
	const defaultPokemon = [] as Pokemon[][];
</script>

<div class="box" class:check-mode={checkMode}>
	<h3>{#if box.namePrefix}{$t(box.namePrefix)} {/if}{box.name}</h3>
	<div class="box-content" class:effie={$config.forms.genderForms == GenderFormsType.DOUBLE_ALL}>
		{#if $config.forms.genderForms == GenderFormsType.DOUBLE_ALL}
			{#each box.pokemons.reduce((result, p, i, a) => i % 2 === 0 ? [...result, (a[i+1] ? [p, a[i+1]]: [p])] : result, defaultPokemon) as pokemonGroup, i}
				<div class="group">
					{#each pokemonGroup as p, j}
						<button
							on:click|stopPropagation={() => {
								onPokemonClicked(p, i*2 + j);
							}}
							class="pokemon"
							class:highlight={p.matchSearch}
							class:checked={$checked.includes(getPokemonSignature(p))}
							class:first={p.group == Group.FIRST}
							class:middle={p.group == Group.MIDDLE}
							class:last={p.group == Group.LAST}
							class:male={isMale(p)}
							class:female={isFemale(p)}
						>
							<div class="groupbar" style="--bar-color: rgb(145, 225, 203)"></div>
							<div class="check"></div>
							<div class="sex"></div>
							{#if p.sexedForms.length > 1}
								<div class="multiple-forms">{p.sexedForms.length}</div>
							{/if}
							<PokemonPicture pokemon={p} title={$tl(p.pokemonData.name)} />
						</button>
					{/each}
				</div>
			{/each}
		{:else}
		{#each box.pokemons as pokemon, i (getPokemonSignature(pokemon))}
			<button
				on:click|stopPropagation={() => {
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
			>
				<div class="groupbar" style="--bar-color: rgb(145, 225, 203)"></div>
				<div class="check"></div>
				<div class="sex"></div>
				{#if pokemon.sexedForms.length > 1}
					<div class="multiple-forms">{pokemon.sexedForms.length}</div>
				{/if}
				<PokemonPicture {pokemon} title={$tl(pokemon.pokemonData.name)} />
			</button>
		{/each}
		{/if}
		{#if $infoPanelPokemon && box.pokemons.includes($infoPanelPokemon)}
			{#key getPokemonSignature($infoPanelPokemon)}
			<div class="details-panel" style="top: {(Math.floor(infoPanelPokemonIndex / 6) + 1) * 20}%">
				<InfoPanel pokemon={$infoPanelPokemon}/>
			</div>
			{/key}
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

	.box-content.effie {
		grid-template-columns: repeat(3, 1fr); /* creates 6 columns */
		grid-auto-flow: column;
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
		background-image: url("/images/checkmark.svg");
	}

	.box.check-mode .pokemon.checked {
		background-image: url("/images/checkmark.svg");
	}
	.box.check-mode .pokemon:not(.checked) {
		background-image: url("/images/crossmark.svg");
	}

	.pokemon .sex {
		position: absolute;
		bottom: 6%;
		left: 6%;
		width: 17%;
		height: 17%;
	}

	.pokemon.male .sex {
		background-image: url("/images/maleicon.svg");
	}

	.pokemon.female .sex {
		background-image: url("/images/femaleicon.svg");
	}

	.pokemon .multiple-forms {
		background-image: url("/images/multipleformsicon.svg");
		position: absolute;
		bottom: 6%;
		right: 6%;
		width: 17%;
		height: 17%;
		color: white;
		font-size: 60%;
		font-weight: bold;
	}

	.group {
		display: flex;
	}

	</style>
