import generations from '../data/generations.json'
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
    F = "F",
    MF = "MF",
}

// Enum used to visually group several forms of the same pokemon
export enum Group {
    FIRST = "FIRST",
    MIDDLE = "MIDDLE",
    LAST = "LAST"
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
    sexedForms: SexedForm[];
    dexNumber?: number;
    matchSearch?: boolean;
    group?: Group;
}

interface FormData {
    id: number;
    name?: LocalizedName;
    sex: string;
    region?: Region;
    event?: boolean;
}

export interface SexedForm {
    form: FormData;
    sex?: Sex;
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

function getPokemonsWithFormsFiltered(pokemonsData: PokemonData[], filter: PokemonFilterConfig): Pokemon[] {
    const result = pokemonsData.flatMap((pokemon) => {
        const formType = FormType[pokemon.formType as keyof typeof FormType]

        // Filter forms to keep
        const forms = pokemon.forms.filter(f => isPokemonFormIncluded(pokemon, f, filter));

        if (forms.length === 0) {
            return []
        }

        // squash forms we don't need in separate slots
        const separateForms = forms.filter(f => shouldFormHasSeparateSlot(f, formType, filter.forms)).map(f => [f]);
        const squashedForms = forms.filter(f => !shouldFormHasSeparateSlot(f, formType, filter.forms));
        // Special forms are only merged if there is a normal form to merge to, otherwise just exclude the form
        const formesSquashed = squashedForms.length && (separateForms.length === 0 || squashedForms.some(f => !f.event && !f.region)) ? [squashedForms, ...separateForms] : separateForms

        return formesSquashed.flatMap((forms: FormData[]) => {
            // Separate male and female with different appearance for each form (to be at least displayed in alternate forms)
            const sexedForms: SexedForm[] = forms.flatMap(form => {
                switch (form.sex) {
                    case "fd":
                        return [{form, sex: Sex.M}, {form, sex: Sex.F}];
                    case "mo":
                        return [{form, sex: Sex.M}];
                    case "fo":
                        return [{form, sex: Sex.F}];
                    case "mf":
                        return [{form, sex: Sex.MF}];
                    default:
                        return [{form}];
                }
            })

            if (filter.forms.maleFemaleForms && sexedForms.some(f => f.form.sex == "fd")) {
                // If we request male and female forms in separate slots, and at least one of the forms has male and female forms, group by sex
                const maleForms = sexedForms.filter(f => f.sex === Sex.M)
                const femaleForms = sexedForms.filter(f => f.sex === Sex.F)
                return [maleForms, femaleForms]
            }

            return [sexedForms]
        }).map(sexedForms => ({
                pokemonData: pokemon,
                sexedForms,
            } as Pokemon));
    });

    return result;
}

function shouldFormHasSeparateSlot(form: FormData, formType: FormType, filter: PokemonFormsFilter) {
    if (form.event) {
        return filter.event;
    }

    if (form.region) {
        return filter.regions.includes(form.region);
    }

    return filter.types.includes(formType);
        
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

    let pokemons = getPokemonsWithFormsFiltered(pokemonsData, filter);

    if (filter.pokedex == "national") {
        pokemons.sort((a, b) => ((a.pokemonData.id || 0) - (b.pokemonData.id || 0)))
    } else {
        // Add regional dex id
        pokemons = pokemons.map(p => ({...p, dexNumber: p.pokemonData.regionalDex[filter.pokedex].id}))

        // Sort
        pokemons.sort((a, b) => ((a.dexNumber || 0) - (b.dexNumber || 0)))
    }

    // Check which pokemon matches search 
    if (search.length) {
        pokemons = pokemons.map(p => search.some(m => p.sexedForms.some(f => isPokemonFormMatch(p.pokemonData, f.form, m))) ? { ...p, matchSearch: true } : p)
    }

    // Add group info of the same pokemon
    let previousPokemon: Pokemon | undefined;
    for (const pokemon of pokemons) {
        if (!previousPokemon) {
            pokemon.group = Group.FIRST;
        } else {
            if (pokemon.pokemonData.id != previousPokemon.pokemonData.id) {
                pokemon.group = Group.FIRST;
                if (previousPokemon.group == Group.MIDDLE) {
                    previousPokemon.group = Group.LAST;
                } else if (previousPokemon.group == Group.FIRST) {
                    previousPokemon.group = undefined;
                }
            } else {
                pokemon.group = Group.MIDDLE;
            }
        }

        previousPokemon = pokemon;
    }
    if (previousPokemon) {
        if (previousPokemon.group == Group.MIDDLE) {
            previousPokemon.group = Group.LAST;
        } else if (previousPokemon.group == Group.FIRST) {
            previousPokemon.group = undefined;
        }
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

function isPokemonFormIncluded(pokemon: PokemonData, form: FormData, filter: PokemonFilterConfig) {
    if (!isPokemonFormInPokedex(pokemon, form, filter.pokedex)) {
        return false;
    }
    if (filter.include.length && !filter.include.some(m => isPokemonFormMatch(pokemon, form, m))) {
        return false;
    }

    if (filter.exclude.some(m => isPokemonFormMatch(pokemon, form, m))) {
        return false;
    }

    return true;
}

function isPokemonFormMatch(pokemon: PokemonData, form: FormData, matcher: string) {
    const matchPokemon = matcher.match(/p-(\d+)/)
    if (matchPokemon) {
        return pokemon.id === +matchPokemon[1]
    }

    const matchGeneration = matcher.match(/g-(\d+)/)
    if (matchGeneration) {
        const genId = +matchGeneration[1]
        const generation = generations.find(g => g.id === genId)
        if (!generation) {
            return false;
        }
        return pokemon.id >= generation.start && pokemon.id <= generation.end;
    }

    const matchPokedex = matcher.match(/d-(\w+)/)
    if (matchPokedex) {
        const dexId = matchPokedex[1]
        return isPokemonFormInPokedex(pokemon, form, dexId);
    }

    const matchRegionalForm = matcher.match(/r-(\w+)/)
    if (matchRegionalForm) {
        const region = matchRegionalForm[1]
        return form.region === region;
    }

    return false
}

function isPokemonFormInPokedex(pokemon: PokemonData, form: FormData, dexId: string) {
    const regInfo = pokemon.regionalDex[dexId]
    // this pokemon has to be in this pokedex, and either no forms specified (meaning are included) or the form is included in the specified forms
    return regInfo !== undefined && (regInfo.forms === undefined ||  regInfo.forms.includes(form.id));
}