<script lang="ts">
	import {
		defaultConfig,
		FormType,
		Region,
		type PokemonFilterConfig
	} from './box-order-generator/box-order-generator';
	import generations from '$lib/data/generations.json';
	import pokedexes from '$lib/data/pokedexes.json';
	import PokemonsMatcherField from './PokemonsMatcherField.svelte';
	import { config } from './stores';

	function toogleNewBoxGeneration(e: Event) {
		const checkbox = e.target as HTMLInputElement;
		$config.newBoxAtGenerations = checkbox.checked ? generations.map((g) => g.id) : [];
	}
</script>

<div class="filter-form">
	<div>
		Pokedex
		<select bind:value={$config.pokedex}>
			{#each pokedexes as pokedex}
				<option value={pokedex.id}>{pokedex.name.fr}</option>
			{/each}
		</select>
	</div>
	<div>
		Include
		<PokemonsMatcherField bind:value={$config.include} placeholder="Pokemons to exclude" />
	</div>
	<div>
		Exclude
		<PokemonsMatcherField bind:value={$config.exclude} placeholder="Pokemons to exclude" />
	</div>
	<div>
		<label>
			<input
				type="checkbox"
				on:change={toogleNewBoxGeneration}
				name="newBoxGenerations"
				checked={$config.newBoxAtGenerations.length == generations.length}
			/>
			New box at generation
		</label>
		<ul>
			{#each generations as generation}
				<li>
					<label>
						<input
							type="checkbox"
							bind:group={$config.newBoxAtGenerations}
							name="newBoxGenerations"
							value={generation.id}
						/>
						{generation.name.fr}
					</label>
				</li>
			{/each}
		</ul>
	</div>
	<h3>Forms to include</h3>
	<div>
		<label>
			<input type="checkbox" bind:checked={$config.forms.maleFemaleForms} />
			Male and female forms
		</label>
	</div>
	<div>
		<label>
			<input type="checkbox" bind:checked={$config.forms.event} />
			Event forms
		</label>
	</div>
	<div>
		Form Types
		<ul>
			{#each Object.values(FormType) as type}
				<li>
					<label>
						<input type="checkbox" bind:group={$config.forms.types} name="types" value={type} />
						{type}
					</label>
				</li>
			{/each}
		</ul>
	</div>
	<div>
		Regional Forms
		<ul>
			{#each Object.values(Region) as region}
				<li>
					<label>
						<input
							type="checkbox"
							bind:group={$config.forms.regions}
							name="region"
							value={region}
						/>
						{region}
					</label>
				</li>
			{/each}
		</ul>
	</div>
</div>
