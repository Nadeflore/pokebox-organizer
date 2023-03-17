import type { PokemonData } from "$lib/box-order-generator/box-order-generator";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch(`../data/out.json`); // stored in static folder
    const pokemons = await response.json() as PokemonData[];
    return {
        pokemons
    }
}