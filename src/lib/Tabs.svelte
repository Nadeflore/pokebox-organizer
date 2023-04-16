<script>
	import { state } from './stores';
</script>

<div class="tabs">
	{#each $state.tabs as tab, i}
		{@const active = $state.activeTabId === i}
		<div class="tab" class:active>
			<button on:click={() => ($state.activeTabId = i)}>
				{tab.name}
			</button>
			{#if i != 0 || $state.tabs.length > 1}
				<button
					class="close"
					on:click={() => (confirm(`Remove ${tab.name} ?`) ? state.removeTab(i) : null)}>⨉</button
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
</style>
