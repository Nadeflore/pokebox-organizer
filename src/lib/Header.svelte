<script lang="ts">
	import Button from './Button.svelte';
	import PokemonsMatcherField from './PokemonsMatcherField.svelte';
	import { locale } from './stores';
	import { locales, t } from './i18n/i18n'

	export let search: string[];
	export let settingsPanelOpen: boolean;
	export let checkMode: boolean;
</script>

<div class="header">
	<div class="search">
		<PokemonsMatcherField bind:value={search} placeholder={$t("header.search")} />
	</div>
	<div class="controls">
		<Button on:click={() => (checkMode = !checkMode)}>{$t("header.checkMode")} {checkMode ? "On" :"Off"}</Button>

		<Button on:click={() => (settingsPanelOpen = !settingsPanelOpen)}>{$t("header.settings")}</Button>

		<div class="locale">
			<select bind:value={$locale}>
				{#each locales as l}
				  <option value={l.key}>{l.name}</option>
				{/each}
			  </select>
		</div>
	</div>

</div>

<style>
	.header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		background-color: white;
		padding: 10px;
	}

	.search {
		width: 100%;
		max-width: 400px;
	}

	.controls {
		height: 38px;
	}

	.controls {
		display: flex;
		flex-wrap: nowrap;
	}

	.locale {
		margin-left: 1em;
		display: flex;
		align-items: center;
	}
</style>
