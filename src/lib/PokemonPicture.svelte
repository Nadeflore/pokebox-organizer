<script>
	/**
	 * @type {import("./box-order-generator/box-order-generator").Pokemon}
	 */
	export let pokemon;
	/**
	 * @type {string}
	 */
	export let title;
</script>

<img src={pokemon.imageName} {title} alt={title} />

<style scoped>
	img {
		width: 50px;
	}
</style>
