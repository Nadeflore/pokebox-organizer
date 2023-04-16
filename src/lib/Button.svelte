<button on:click on:mouseover on:mouseenter on:mouseleave on:focus class={$$restProps.class}>
	<slot />
</button>

<style>
	button {
		margin: 3px;
		background-color: rgb(240, 240, 240);
		border-radius: 4px;
		color: #111827;
		font-size: 0.875rem;
		line-height: 1.25rem;
		padding: 0 1rem;
		text-align: center;
	}

	button:hover,
	button:focus {
		background-color: rgb(245, 245, 245);
	}
</style>
