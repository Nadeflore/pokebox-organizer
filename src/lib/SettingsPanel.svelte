<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	import ConfigEdit from './ConfigEdit.svelte';
	import { t } from './i18n/i18n';
	import { state } from './stores';
	import LZString from 'lz-string';

	const dispatch = createEventDispatcher();

	$: shareTabUrl = `${$page.url.origin}?addTab=${LZString.compressToEncodedURIComponent(JSON.stringify($state.tabs[$state.activeTabId]))}`;

	function onCopyUrl() {
		navigator.clipboard.writeText(shareTabUrl)
	}
</script>

<div class="settings-panel">
    <button class="close" on:click={() => {dispatch("close")}}>&#x2715;</button>
	<div class="header">
		<h2>{$t('header.settings')}</h2>
	</div>
	<div class="content">
		<ConfigEdit />
		<div class="share">
			<h3>{$t('tab.share')}</h3>
			<div class="share-field">
				<input type="text" readonly value={shareTabUrl}/> <Button on:click={onCopyUrl}>{$t("tab.copy")}</Button>
			</div>
		</div>
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
		position: relative;
	}

	.share-field {
		display: flex;
	}
	.share-field input {
		flex: 1;
	}

	.close {
        position: absolute;
        padding: 1.5em;
        top: 0;
        right: 0;
    }
</style>
