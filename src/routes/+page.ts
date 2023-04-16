import type { PokemonData } from "$lib/box-order-generator/box-order-generator";
import type { PageLoad } from "./$types";

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch(`../data/pokemons.json`); // stored in static folder
    const pokemonsData = await response.json() as PokemonData[];
    return {
        pokemonsData
    }
}