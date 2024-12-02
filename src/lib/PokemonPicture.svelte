<script lang="ts">
	import { Sex, type Pokemon } from './box-order-generator/box-order-generator';

	export let pokemon: Pokemon;
	export let title: string;
	export let formIndex = 0;

	function getImageFileName(pokemon: Pokemon): string {
		const pokemonId = pokemon.pokemonData.id;
		const sexedForm = pokemon.sexedForms[formIndex];
		const formId = sexedForm.form.id;
		const sex = sexedForm.form.sex == "fd" && sexedForm.sex == Sex.M ? "md" : sexedForm.form.sex;
		const formId2 = sexedForm.subFormId || 0;
		const name = `/images/pokemons/poke_capture_${String(pokemonId).padStart(4, '0')}_${String(formId).padStart(3, '0')}_${sex}_n_${String(formId2).padStart(8, '0')}_f_n.webp`;
		return name
	}
</script>

<img src={getImageFileName(pokemon)} {title} alt={title} />

<style scoped>
	img {
		width: 80%;
		padding: 10%;
		display: block;
	}
</style>
