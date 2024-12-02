<script lang="ts">
	import { FormType, MaleFemaleFormsType, Region } from './box-order-generator/box-order-generator';
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
		<h3>Forms to be in separate slot</h3>
		<h4>Male and Female forms</h4>
		<ul>
			{#each Object.values(MaleFemaleFormsType) as type}
				<li>
					<label>
						<input type="radio" bind:group={$config.forms.maleFemaleForms} name="mftypes" value={type} />
						{type}
					</label>
				</li>
			{/each}
		</ul>
		<div>
		</div>
		<div>
			<h4>Form Types</h4>
			<ul>
				{#each [FormType.NORMAL, FormType.CHANGE, FormType.CHANGE_LEG] as type}
					<li>
						<label>
							<input type="checkbox" bind:group={$config.forms.types} name="types" value={type} />
							{type}
						</label>
					</li>
				{/each}
				<li>
					<label>	
						<input type="checkbox" bind:checked={$config.forms.event} />
						Event forms
					</label>
				</li>
				<li>
					<label>	
						<input type="checkbox" bind:checked={$config.forms.subForm} />
						Charmilly sub forms
					</label>
				</li>
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
			Pattern
			<input bind:value={$config.boxNamePattern} />
		</label>
	</section>
</div>
