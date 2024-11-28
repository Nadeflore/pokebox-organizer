import generations from '../data/generations.json'
import pokedexes from '../data/pokedexes.json'
export interface Generation {
    id: number;
    name: LocalizedName;
    start: number;
    end: number;
}

export interface PokemonFilterConfig {
    name: string;
    include: string[];
    exclude: string[];
    pokedex: string;
    newBoxAtGenerations: number[];
    forms: PokemonFormsFilter;
    boxNamePattern: string;
}

export const defaultConfig = {
    name: "New config",
    pokedex: 'national',
    include: [],
    exclude: [],
    newBoxAtGenerations: [],
    forms: {
        maleFemaleForms: false,
        types: [],
        event: false,
        regions: [],
        onlySpecialForms: false
    },
    boxNamePattern: "{gen}G - {genboxnb}",
};

interface PokemonFormsFilter {
    maleFemaleForms: boolean;
    types: FormType[];
    event: boolean;
    regions: Region[];
    onlySpecialForms: boolean;
}

export enum FormType {
    NORMAL = "NORMAL",
    SEX = "SEX",
    CHANGE = "CHANGE",
    CHANGE_LEG = "CHANGE_LEG",
}

export enum Region {
    ALOLA = "ALOLA",
    GALAR = "GALAR",
    HISUI = "HISUI",
    PALDEA = "PALDEA",
}

export enum Sex {
    M = "M",
    F = "F"
}

interface LocalizedName {
    ja?: string;
    ko?: string;
    fr?: string;
    de?: string;
    es?: string;
    it?: string;
    en?: string;
}

export interface Pokemon {
    pokemonData: PokemonData;
    forms: FormData[];
    sexes: Sex[];
    imageName: string;
    sexForm?: boolean;
    multipleForms?: boolean;
    dexNumber?: number;
    matchSearch?: boolean;
    checked?: boolean;
}

interface FormData {
    id: number;
    name?: LocalizedName;
    sex: string;
    region?: Region;
    event?: boolean;
}

export interface regionalDexInfo {
    id: number,
    forms: number[]
}

export interface PokemonData {
    forms: FormData[];
    formType: "NORMAL" | "CHANGE_LEG" | "CHANGE" | "SEX";
    id: number;
    name: LocalizedName;
    regionalDex: Record<string, regionalDexInfo>
}

function getPokemonsWithForms(pokemons: PokemonData[], formsFilter: PokemonFormsFilter): Pokemon[] {
    const result = pokemons.flatMap((pokemon) => {
        const formType = FormType[pokemon.formType as keyof typeof FormType]

        const forms = pokemon.forms
            .flatMap((form: FormData) => {
                switch (form.sex) {
                    case 'fd':
                        if (formsFilter.maleFemaleForms) {
                            return [{ ...form, sex: 'md', sexes: [Sex.M], sexForm: true }, { ...form, sexes: [Sex.F], sexForm: true }];
                        } else {
                            return [{ ...form, sexes: [Sex.M, Sex.F], sexForm: false }];
                        }
                    case 'mf':
                        return [{ ...form, sexes: [Sex.M, Sex.F], sexForm: false }];
                    case 'mo':
                        return [{ ...form, sexes: [Sex.M], sexForm: false }];
                    case 'fo':
                        return [{ ...form, sexes: [Sex.F], sexForm: false }];
                    case 'uk':
                        return [{ ...form, sexes: [], sexForm: false }];
                    default:
                        throw new Error("Invalid sex: " + form.sex)
                }
            }).map(form => ({
                pokemonData: pokemon,
                forms: [form],
                sexes: form.sexes,
                imageName: getImageFileName(pokemon.id, form.id, form.sex),
                sexForm: form.sexForm,
            } as Pokemon));


        // Regional and event forms are always separated, but may be excluded (never squashed)
        // Squash other forms if the form type is not requested
        const eventAndRegionalForms = forms.filter(form => (form.forms[0].event || form.forms[0].region) && (formsFilter.event || !form.forms[0].event) && (!form.forms[0].region || formsFilter.regions.includes(form.forms[0].region)));
        let otherForms = forms.filter(form => !form.forms[0].event && !form.forms[0].region)

        if (formType) {
            if (formsFilter.types.includes(formType)) {
                otherForms = otherForms.map(form => ({ ...form, multipleForms: true }))
            } else {
                otherForms = [otherForms.reduce((a, b) => ({
                    ...a,
                    formIds: a.forms.concat(b.forms),
                    sexes: [...new Set(a.sexes.concat(b.sexes))],
                }))]
            }
        }

        if (formsFilter.onlySpecialForms) {
            return eventAndRegionalForms;
        } else {
            return otherForms.concat(eventAndRegionalForms)
        }
    });

    return result;
}

function getImageFileName(pokemonId: number, formId: number, sex: string): string {
    const formId2 = pokemonId == 869 ? formId % 7 : 0;
    const name = `/images/pokemons/poke_capture_${String(pokemonId).padStart(4, '0')}_${String(formId).padStart(3, '0')}_${sex}_n_${String(formId2).padStart(8, '0')}_f_n.webp`;
    return name
}

function splitArray<Type>(arr: Array<Type>, size: number): Array<Array<Type>> {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

/** 
 * A findIndex method which returns undefined when nothing match the predicate
 */
function findIndex<Type>(arr: Array<Type>, predicate: (value: Type, index: number, obj: Type[]) => boolean): number | undefined {
    const index = arr.findIndex(predicate)
    return index == -1 ? undefined : index

}

function splitByGeneration(pokemons: Pokemon[], genIds: number[]) {
    const splits = [1].concat(genIds.map(gid => generations.find(g => g.id == gid)?.start || -1));
    return splits.map((start, i, array) => {
        const end = array[i + 1];
        const startIndex = findIndex(pokemons, (p) => p.pokemonData.id >= start);
        if (startIndex === undefined) {
            return [];
        }
        const endIndex = end ? findIndex(pokemons, (p) => p.pokemonData.id >= end) : pokemons.length;
        return pokemons.slice(startIndex, endIndex);
    }).filter(e => e.length);
}

export function getPokemonBoxes(pokemonsData: PokemonData[], filter: PokemonFilterConfig, search: string[]) {
    if (!filter) {
        return [];
    }

    let pokemons = getPokemonsWithForms(pokemonsData, filter.forms);

    // Filter pokemons to keep
    pokemons = pokemons.filter(p => isPokemonIncluded(p, filter));


    // Add regional dex id
    pokemons = pokemons.map(p => ({...p, dexNumber: p.pokemonData.regionalDex[filter.pokedex].id}))

    // Sort
    pokemons.sort((a, b) => ((a.dexNumber || 0) - (b.dexNumber || 0)))

    // Check which pokemon matches search 
    if (search.length) {
        pokemons = pokemons.map(p => search.some(m => isPokemonMatch(p, m)) ? { ...p, matchSearch: true } : p)
    }

    const newBoxAtGenerations = filter.pokedex == "national" ? filter.newBoxAtGenerations : [];
    return addBoxNames(splitByGeneration(pokemons, newBoxAtGenerations).flatMap((pokemons) => splitArray(pokemons, 30)), filter.boxNamePattern);
}

function getGeneration(pokemon: Pokemon) {
    const generation = generations.find(g => pokemon.pokemonData.id >= g.start && pokemon.pokemonData.id <= g.end);
    if (generation === undefined) {
        throw Error("Unable to find generation for pokemon : " + pokemon.pokemonData.id);
    }

    return generation;
}

function addBoxNames(boxes: Pokemon[][], namePattern: string) {
    // Fallback to default pattern
    if (!namePattern) {
        namePattern = defaultConfig.boxNamePattern;
    }
    let currentGen: Generation | null = null;
    let currentGenBox = 0;
    let boxNb = 0;
    return boxes.map(box => {
        boxNb++;
        const gensInBox = box.map(p => getGeneration(p));
        const gensInBoxUniques = gensInBox.filter((g, i) => gensInBox.indexOf(g) === i)

        const boxName = [...new Set(gensInBoxUniques.map(g => {
            if (g === currentGen) {
                currentGenBox++;
            } else {
                currentGen = g;
                currentGenBox = 1;
            }
            return namePattern.replaceAll("{gen}", g.id.toString()).replaceAll("{genboxnb}", currentGenBox.toString()).replaceAll("{boxnb}", boxNb.toString());
        }))].join(", ");

        return {
            name: boxName,
            pokemons: box
        }
    });
}

function isPokemonIncluded(pokemon: Pokemon, filter: PokemonFilterConfig) {
    if (!isPokemonInPokedex(pokemon, filter.pokedex)) {
        return false;
    }
    if (filter.include.length && !filter.include.some(m => isPokemonMatch(pokemon, m))) {
        return false;
    }

    if (filter.exclude.some(m => isPokemonMatch(pokemon, m))) {
        return false;
    }

    return true;
}

function isPokemonMatch(pokemon: Pokemon, matcher: string) {
    const matchPokemon = matcher.match(/p-(\d+)/)
    if (matchPokemon) {
        return pokemon.pokemonData.id === +matchPokemon[1]
    }

    const matchGeneration = matcher.match(/g-(\d+)/)
    if (matchGeneration) {
        const genId = +matchGeneration[1]
        const generation = generations.find(g => g.id === genId)
        if (!generation) {
            return false;
        }
        return pokemon.pokemonData.id >= generation.start && pokemon.pokemonData.id <= generation.end;
    }

    const matchPokedex = matcher.match(/d-(\w+)/)
    if (matchPokedex) {
        const dexId = matchPokedex[1]
        return isPokemonInPokedex(pokemon, dexId);
    }

    const matchRegionalForm = matcher.match(/r-(\w+)/)
    if (matchRegionalForm) {
        const region = matchRegionalForm[1]
        return pokemon.forms.some(f => f.region === region)
    }

    return false
}

function isPokemonInPokedex(pokemon: Pokemon, dexId: string) {
    const regInfo = pokemon.pokemonData.regionalDex[dexId]
    // this pokemon has to be in this pokedex, and either no forms specified (meaning are included) or the form is included in the specified forms
    return regInfo !== undefined && (regInfo.forms === undefined ||  pokemon.forms.some(f => regInfo.forms.includes(f.id)));
}