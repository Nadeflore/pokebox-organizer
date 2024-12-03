<script lang="ts">
	import ConfigEdit from './ConfigEdit.svelte';
	import { t } from './i18n/i18n';
</script>

<div class="settings-panel">
	<div class="header">
		<h2>{$t('header.settings')}</h2>
	</div>
	<div class="content">
		<ConfigEdit />
	</div>
</div>

<style>
	@media only screen and (min-width: 800px) {
		.settings-panel {
			width: 25em;
		}
	}

	.settings-panel {
		padding: 20px;
	}
</style>
