<script lang="ts">
	import type { PokemonFilterConfig } from './box-order-generator/box-order-generator';
	import ConfigEdit from './ConfigEdit.svelte';
</script>

<div class="settings-panel">
	<div class="header">
		<h2>Settings</h2>
	</div>
	<div class="content">
		<ConfigEdit />
	</div>
</div>

<style>
	.settings-panel {
		height: 100%;
		width: 100%;
	}

	.content,
	.header {
		padding: 10px;
	}
</style>
