<script lang="ts">
	import type { PokemonFilterConfig } from './box-order-generator/box-order-generator';
	import ConfigEdit from './ConfigEdit.svelte';

	export let open = false;
</script>

<div class="settings-panel" class:closed={!open}>
	<div class="header">
		<h2>Settings</h2>
		<button
			on:click={() => {
				open = false;
			}}>Close</button
		>
	</div>
	<div class="content">
		<ConfigEdit />
	</div>
</div>

<style>
	@media only screen and (max-width: 800px) {
		.settings-panel {
			flex: 1 !important;
		}
	}

	.settings-panel {
		height: 100%;
		overflow-y: auto;
		flex: 0 0 400px;
	}

	.settings-panel.closed {
		display: none;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}

	.content {
		padding: 10px;
	}
</style>
