<script lang="ts">
	import { type FormData, Sex, type SexedForm, type Pokemon } from './box-order-generator/box-order-generator';

	export let pokemon: Pokemon;
	export let title: string;
	export let sexedForm = undefined as SexedForm | undefined;
	export let form = undefined as FormData | undefined;
	export let gigantamax = false;

	function getImageFileName(pokemon: Pokemon): string {
		if (sexedForm == undefined && form == undefined) {
			sexedForm = pokemon.sexedForms[0];
		}

		const pokemonId = pokemon.pokemonData.id;
		let formId;
		let sex;
		let formId2 = 0;
		let type = 'n';
		if (sexedForm) {
			formId = sexedForm.form.id;
			sex = sexedForm.form.sex == "fd" && sexedForm.sex == Sex.M ? "md" : sexedForm.form.sex;
			formId2 = sexedForm.subFormId || 0;
		} else if (form) {
			formId = form.id;
			sex = form.sex;
		} else {
			throw Error("No form specified")
		}
		
		if (gigantamax) {
			type = 'g';
			if (sex == "fd") {
				sex = "mf";
			}
		}

		const name = `/images/pokemons/poke_capture_${String(pokemonId).padStart(4, '0')}_${String(formId).padStart(3, '0')}_${sex}_${type}_${String(formId2).padStart(8, '0')}_f_n.webp`;
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
