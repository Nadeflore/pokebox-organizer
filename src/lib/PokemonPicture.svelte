<script lang="ts">
	import type { Pokemon } from './box-order-generator/box-order-generator';

	export let pokemon: Pokemon;
	export let title: string;
</script>

<img src={pokemon.imageName} {title} alt={title} />

<style scoped>
	img {
		width: 50px;
	}
</style>
