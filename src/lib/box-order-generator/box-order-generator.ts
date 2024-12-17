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


export enum GenderFormsType {
    ALL = "ALL",
    APPEARANCE = "APPEARANCE",
    SPECS = "SPECS",
    NONE = "NONE",
}

interface PokemonFormsFilter {
    genderForms: GenderFormsType;
    types: FormType[];
    event: boolean;
    subForm: boolean;
    regions: Region[];
    genderFormsInSeparateBox: boolean;
    regionalFormsInSeparateBox: boolean;
    otherFormsInSeparateBox: boolean;
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

export type LocalizedName = Record<string, string>;

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
    subFormId?: number;
}

export interface RegionalDexInfo {
    id: number,
    forms: number[]
}

interface SubForm {
    id: number;
    name?: LocalizedName;
}

export interface PokemonData {
    forms: FormData[];
    formType: "NORMAL" | "CHANGE_LEG" | "CHANGE" | "SEX";
    id: number;
    name: LocalizedName;
    regionalDex: Record<string, RegionalDexInfo>;
    subForms?: SubForm[];
    gigantamax?: boolean;
}

export const defaultConfig = {
    name: "New config",
    pokedex: 'national',
    include: [],
    exclude: [],
    newBoxAtGenerations: [],
    forms: {
        genderForms: GenderFormsType.NONE,
        types: [],
        event: false,
        regions: [],
        subForm: false,
        genderFormsInSeparateBox: false,
        regionalFormsInSeparateBox: false,
        otherFormsInSeparateBox: false,
    } as PokemonFormsFilter,
    boxNamePattern: "{gen}G - {genboxnb}",
} as PokemonFilterConfig;

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
                        // separate every male female (if requested)
                        if (filter.forms.genderForms == GenderFormsType.ALL) {
                            return [{form, sex: Sex.M}, {form, sex: Sex.F}];
                        } else {
                            return [{form, sex: Sex.MF}];
                        }
                    default:
                        return [{form}];
                }
            })

            if (filter.forms.genderForms == GenderFormsType.APPEARANCE && sexedForms.some(f => f.form.sex == "fd") || filter.forms.genderForms == GenderFormsType.ALL && sexedForms.some(f => f.form.sex == "fd" || f.form.sex == "mf")) {
                // If we request male and female forms in separate slots, and at least one of the forms has male and female forms, group by sex
                const maleForms = sexedForms.filter(f => f.sex === Sex.M)
                const femaleForms = sexedForms.filter(f => f.sex === Sex.F)
                return [maleForms, femaleForms].filter(forms => forms.length > 0)
            }

            return [sexedForms]
        }).flatMap((sexedForms: SexedForm[]) => {
            if (!pokemon.subForms) {
                return [sexedForms];
            }
            const pokemonSubForms = pokemon.subForms;
            // Create a separate entry for each subform
            const subForms = sexedForms.flatMap(sexedForm => {
                return pokemonSubForms.map(subForm => ({...sexedForm, subFormId: subForm.id}))
            })

            if (filter.forms.subForm) {
                // Separate each subform
                return pokemonSubForms.map(subForm => subForms.filter(f => f.subFormId == subForm.id));
            }

            return[subForms];

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

    return filter.types.includes(formType) || filter.genderForms != GenderFormsType.NONE && formType == FormType.SEX;
        
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

function separateFormsToBeInSeparateBox(pokemons: Pokemon[], formsConfig: PokemonFormsFilter) {
    console.log("Separate called again")
    const normal = [] as Pokemon[];
    const genderForms = [] as Pokemon[];
    const regionalFormsByRegion = {} as Record<Region, Pokemon[]>;
    const otherForms = [] as Pokemon[];

    pokemons.forEach((current, i) => {
        const previous = i== 0 ? null : pokemons[i-1]

        if (previous?.pokemonData.id == current.pokemonData.id) {
            if (formsConfig.genderFormsInSeparateBox && current.sexedForms.length == 1 && current.sexedForms[0].sex == Sex.F &&
                    previous?.sexedForms.length == 1 && previous.sexedForms[0].sex == Sex.M) {
                genderForms.push(current);
                return;
            }

            if (formsConfig.regionalFormsInSeparateBox && current.sexedForms.length == 1 && current.sexedForms[0].form.region) {
                const region = current.sexedForms[0].form.region;
                if (!regionalFormsByRegion[region]) {
                    regionalFormsByRegion[region] = [];
                }
                regionalFormsByRegion[region].push(current);
                return;
            }

            if (formsConfig.otherFormsInSeparateBox && current.sexedForms.length == 1 && !current.sexedForms[0].form.region && (!!current.pokemonData.formType || current.sexedForms[0].form.event)) {
                otherForms.push(current);
                return;
            }
        }

        normal.push(current);
    })

    const result = [{pokemons: normal}] as {pokemons: Pokemon[], namePrefix: string | undefined}[];

    if (genderForms.length > 0) {
        result.push({namePrefix: "forms.female", pokemons: genderForms})
    }

    for (const [region, pokemons] of Object.entries(regionalFormsByRegion)) {
        if (pokemons.length > 0) {
            result.push({namePrefix: `regionalForms.${region}`, pokemons})
        }
    }
    if (otherForms.length > 0) {
        result.push({namePrefix: "forms.other", pokemons: otherForms})
    }

    return result;
}

export function getPokemonBoxes(pokemonsData: PokemonData[], filter: PokemonFilterConfig, search: string[]) {
    if (!filter) {
        return [];
    }

    const pokemons = getPokemonsWithFormsFiltered(pokemonsData, filter);

    return separateFormsToBeInSeparateBox(pokemons, filter.forms).flatMap(group => {

        let pokemons = group.pokemons;

        const boxNamePattern = group.namePrefix ? "- {boxnb}" : filter.boxNamePattern;

        if (filter.pokedex == "national") {
            pokemons.sort((a, b) => ((a.pokemonData.id) - (b.pokemonData.id)))
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

        const nationalDexAndRegular = filter.pokedex == "national" && !group.namePrefix;
        const pokemonsByGeneration = nationalDexAndRegular ? splitByGeneration(pokemons, filter.newBoxAtGenerations) : [pokemons];
        return addBoxNames(pokemonsByGeneration.flatMap((pokemons) => splitArray(pokemons, 30)), group.namePrefix, boxNamePattern, nationalDexAndRegular);

    })
}

function getGeneration(pokemon: Pokemon) {
    const generation = generations.find(g => pokemon.pokemonData.id >= g.start && pokemon.pokemonData.id <= g.end);
    if (generation === undefined) {
        throw Error("Unable to find generation for pokemon : " + pokemon.pokemonData.id);
    }

    return generation;
}

function addBoxNames(boxes: Pokemon[][], namePrefix: string | undefined, namePattern: string, nationalDex: boolean) {
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
            let boxName = namePattern.replaceAll("{boxnb}", boxNb.toString());
            if (nationalDex) {
                boxName = boxName.replaceAll("{gen}", g.id.toString()).replaceAll("{genboxnb}", currentGenBox.toString())
            }
            return boxName;
        }))].join(", ");

        return {
            namePrefix,
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

    switch(matcher) {
        case "gigantamax":
            return pokemon.gigantamax;
    }

    throw new Error(`Unknown matcher : ${matcher}`)
}

function isPokemonFormInPokedex(pokemon: PokemonData, form: FormData, dexId: string) {
    const regInfo = pokemon.regionalDex[dexId]
    // this pokemon has to be in this pokedex, and either no forms specified (meaning are included) or the form is included in the specified forms
    return regInfo !== undefined && (regInfo.forms === undefined ||  regInfo.forms.includes(form.id));
}

export function getPokemonSignature(pokemon: Pokemon) {
    const firstForm = pokemon.sexedForms[0];
    const sex = firstForm.sex && firstForm.sex != Sex.MF ? firstForm.sex : firstForm.form.sex == "mf" ? Sex.M: "";
    let signature =  `${pokemon.pokemonData.id}-${firstForm.form.id}-${sex}`;
    if (pokemon.pokemonData.subForms) {
        signature += `-${firstForm.subFormId}`
    }
    return signature
}

export function isEveryPokemonChecked(pokemonsData: PokemonData[], filter: PokemonFilterConfig, checked: string[]) {
    return getPokemonsWithFormsFiltered(pokemonsData, filter).every(p => checked.includes(getPokemonSignature(p)));
}