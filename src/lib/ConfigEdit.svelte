<script lang="ts">
	import { FormType, Region } from './box-order-generator/box-order-generator';
	import generations from '$lib/data/generations.json';
	import pokedexes from '$lib/data/pokedexes.json';
	import PokemonsMatcherField from './PokemonsMatcherField.svelte';
	import { config } from './stores';
	import Svelecte from 'svelecte';

	function toogleNewBoxGeneration(e: Event) {
		const checkbox = e.target as HTMLInputElement;
		$config.newBoxAtGenerations = checkbox.checked ? generations.map((g) => g.id) : [];
	}

	const pokedexesOptions = pokedexes.map((dex) => ({
		id: dex.id,
		name: dex.name.fr
	}));
</script>

<div class="filter-form">
	<label>
		name
		<input bind:value={$config.name} />
	</label>
	<section>
		<h3>Pokemons to include</h3>
		<div>
			Pokedex
			<Svelecte options={pokedexesOptions} bind:value={$config.pokedex} searchable={false} />
		</div>
		<div>
			Include
			<PokemonsMatcherField bind:value={$config.include} placeholder="Pokemons to include" />
		</div>
		<div>
			Exclude
			<PokemonsMatcherField bind:value={$config.exclude} placeholder="Pokemons to exclude" />
		</div>
	</section>
	<section>
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
			<h4>Regional Forms</h4>
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
	</section>
	<section>
		<h3>Grouping options</h3>
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
	</section>
	<section>
		<h3>Box name</h3>
		<label>
			Start numbering at
			<input min="0" type="number" bind:value={$config.boxNbStart} />
		</label>
	</section>
</div>
