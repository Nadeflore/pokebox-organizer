<script lang="ts">
	import { isEveryPokemonChecked } from './box-order-generator/box-order-generator';
	import { t } from './i18n/i18n';
	import { state, pokemonsData, type Tab } from './stores';
	
	function isTabComplete(tab: Tab) {
		return 
	}
</script>

<div class="tabs">
	{#each $state.tabs as tab, i}
		{@const active = $state.activeTabId === i}
		<div class="tab" class:active>
			<button on:click={() => ($state.activeTabId = i)}>
				<div class="icon" class:checked={isEveryPokemonChecked($pokemonsData, tab.config, tab.checked)}></div>
				<div class="name">{tab.config.name}</div>
			</button>
			{#if i != 0 || $state.tabs.length > 1}
				<button
					class="close"
					on:click={() => (confirm($t('tab.closeConfirm', {name: tab.config.name})) ? state.removeTab(i) : null)}
					>⨉</button
				>
			{/if}
		</div>
	{/each}
	<button class="add" on:click={() => state.addTab()}>+</button>
</div>

<style>
	.tab {
		display: flex;
	}
	.tab button {
		white-space: nowrap;
		padding: 5px;
		display: block;
	}

	.tab .close {
		font-size: 0.8em;
	}

	.tab,
	.add {
		background-color: rgb(240, 240, 240);
		border-radius: 4px;
		color: #111827;
		margin: 3px;
	}

	.add {
		width: 1.5em;
	}

	.tab.active {
		background-color: antiquewhite;
	}

	.tabs {
		display: flex;
		overflow-x: auto;
		background-color: white;
	}

	.tab button {
		display: flex;
	}

	.icon {
		height: 1em;
		margin-right: 0.1em;
	}

	.icon.checked {
		width: 1em;
		background-image: url("/images/checkmark.svg");
	}

</style>
