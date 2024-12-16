<script lang="ts">
	import { FormType, GenderFormsType, Region } from './box-order-generator/box-order-generator';
	import generations from '$lib/data/generations.json';
	import pokedexes from '$lib/data/pokedexes.json';
	import PokemonsMatcherField from './PokemonsMatcherField.svelte';
	import { config } from './stores';
	import Svelecte from 'svelecte';
	import { t, tl } from './i18n/i18n';

	function toogleNewBoxGeneration(e: Event) {
		const checkbox = e.target as HTMLInputElement;
		$config.newBoxAtGenerations = checkbox.checked ? generations.map((g) => g.id) : [];
	}

	$: pokedexesOptions = pokedexes.map((dex) => ({
		id: dex.id,
		name: $tl(dex.name)
	}));

</script>

<div class="filter-form">
	<label>
		{$t('configEdit.name')}
		<input bind:value={$config.name} />
	</label>
	<section>
		<h3>{$t('configEdit.toInclude')}</h3>
		<div>
			{$t('pokedex.title')}
			<Svelecte options={pokedexesOptions} bind:value={$config.pokedex} searchable={false} />
		</div>
		<div>
			{$t('configEdit.include')}
			<PokemonsMatcherField bind:value={$config.include} placeholder={$t('configEdit.pokemonsToInclude')} />
		</div>
		<div>
			{$t('configEdit.exclude')}
			<PokemonsMatcherField bind:value={$config.exclude} placeholder={$t('configEdit.pokemonsToExclude')} />
		</div>
	</section>
	<section>
		<h3>{$t('configEdit.formsToSeparte')}</h3>
		<h4>{$t('genderForms.title')}</h4>
		<ul>
			{#each Object.values(GenderFormsType) as type}
				<li>
					<label>
						<input type="radio" bind:group={$config.forms.genderForms} name="mftypes" value={type} />
						{$t(`genderForms.${type}`)}
					</label>
				</li>
			{/each}
		</ul>
		<div>
		</div>
		<div>
			<h4>{$t('formTypes.title')}</h4>
			<ul>
				{#each [FormType.NORMAL, FormType.CHANGE, FormType.CHANGE_LEG] as type}
					<li>
						<label>
							<input type="checkbox" bind:group={$config.forms.types} name="types" value={type} />
							{$t(`formTypes.${type}`)}
						</label>
					</li>
				{/each}
				<li>
					<label>	
						<input type="checkbox" bind:checked={$config.forms.event} />
						{$t('formTypes.eventForms')}
					</label>
				</li>
				<li>
					<label>	
						<input type="checkbox" bind:checked={$config.forms.subForm} />
						{$t('formTypes.subForms')}
					</label>
				</li>
			</ul>
		</div>
		<div>
			<h4>{$t('regionalForms.title')}</h4>
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
							{$t(`regionalForms.${region}`)}
						</label>
					</li>
				{/each}
			</ul>
		</div>
	</section>
	{#if $config.pokedex == "national"}
		<section>
			<h3>{$t('configEdit.box')}</h3>
			<div>
				<label>
					<input
						type="checkbox"
						on:change={toogleNewBoxGeneration}
						name="newBoxGenerations"
						checked={$config.newBoxAtGenerations.length == generations.length}
					/>
					{$t('configEdit.newBoxAtGeneration')}
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
								{$tl(generation.name)}
							</label>
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<ul>
					<li>
						<label>	
							<input type="checkbox" bind:checked={$config.forms.genderFormsInSeparateBox} />
							{$t('formTypes.genderFormsInSeparateBox')}
						</label>
					</li>
					<li>
						<label>	
							<input type="checkbox" bind:checked={$config.forms.regionalFormsInSeparateBox} />
							{$t('formTypes.regionalInSeparateBox')}
						</label>
					</li>
					<li>
						<label>	
							<input type="checkbox" bind:checked={$config.forms.otherFormsInSeparateBox} />
							{$t('formTypes.otherFormsInSeparateBox')}
						</label>
					</li>
				</ul>
			</div>
		</section>
	{/if}
	<section>
		<h3>{$t('configEdit.boxName')}</h3>
		<label>
			{$t('configEdit.pattern')}
			<input bind:value={$config.boxNamePattern} />
		</label>
	</section>
</div>
