export interface Generation {
    id: number;
    name: LocalizedName;
    start: number;
    end: number;
}

export interface PokemonMatcher {
    id?: number;
    generation?: Generation;
    pokedex?: string;
}

export interface PokemonFilterConfig {
    include: PokemonMatcher[];
    exclude: PokemonMatcher[];
    sort: string;
    newBoxAtGenerations: Generation[];
    forms: PokemonFormsFilter
}

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
    id: number;
    regionalId: object
    imageName: string;
    name: LocalizedName;
    region: Region | null;
    formIds: number[];
    formNames: LocalizedName[];
    sexes: string[];
    sexForm?: boolean;
    multipleForms?: boolean;
    event: boolean;
}

interface FormData {
    id: number;
    name?: LocalizedName;
    sex: string;
    region?: Region;
    event?: boolean;
}

export interface PokemonData {
    forms: FormData[];
    formType: "NORMAL" | "CHANGE_LEG" | "CHANGE" | "SEX";
    id: number;
    name: LocalizedName;
    regionalId: Record<string, number>
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
                id: pokemon.id,
                regionalId: pokemon.regionalId,
                imageName: getImageFileName(pokemon.id, form.id, form.sex),
                name: pokemon.name,
                formIds: [form.id],
                formNames: [form.name?.fr || form.name?.en || form.id],
                region: form.region ? Region[form.region as keyof typeof Region] : null,
                sexForm: form.sexForm,
                sexes: form.sexes,
                event: form.event,
            }));


        // Regional and event forms are always separated, but may be excluded (never squashed)
        // Squash other forms if the form type is not requested
        const eventAndRegionalForms = forms.filter(form => (form.event || form.region) && (formsFilter.event || !form.event) && (!form.region || formsFilter.regions.includes(form.region)));
        let otherForms = forms.filter(form => !form.event && !form.region)

        if (formType) {
            if (formsFilter.types.includes(formType)) {
                otherForms = otherForms.map(form => ({ ...form, multipleForms: true }))
            } else {
                otherForms = [otherForms.reduce((a, b) => ({
                    ...a,
                    formIds: a.formIds.concat(b.formIds),
                    formNames: a.formNames.concat(b.formNames),
                    sexes: [...new Set(a.sexes.concat(b.sexes))],
                }))]
            }
        }

        return otherForms.concat(eventAndRegionalForms)
    });

    return result;
}

function getImageFileName(pokemonId: number, formId: number, sex: string): string {
    return `/images/pokemons/poke_capture_${String(pokemonId).padStart(4, '0')}_${String(formId).padStart(3, '0')}_${sex}_n_00000000_f_n.webp`;
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

function splitByGeneration(pokemons: Pokemon[], generations: Generation[]) {
    const splits = [1].concat(generations.map(g => g.start));
    return splits.map((start, i, array) => {
        const end = array[i + 1];
        const startIndex = findIndex(pokemons, (p) => p.id >= start);
        if (startIndex === undefined) {
            return [];
        }
        const endIndex = end ? findIndex(pokemons, (p) => p.id >= end) : pokemons.length;
        return pokemons.slice(startIndex, endIndex);
    }).filter(e => e.length);
}

export function getPokemonBoxes(pokemonsData: PokemonData[], filter: PokemonFilterConfig): Pokemon[][] {
    if (!filter) {
        return [];
    }
    // Filter pokemons to keep
    const pokemons = pokemonsData.filter(p => isPokemonIncluded(p, filter));
    // Sort
    const sort = !filter.sort ? "national" : filter.sort;
    pokemons.sort((a, b) => (a.regionalId[sort] || 10000) - (b.regionalId[sort] || 10000))


    const pokemonsWithForms = getPokemonsWithForms(pokemons, filter.forms);

    const newBoxAtGenerations = sort == "national" ? filter.newBoxAtGenerations : [];
    return splitByGeneration(pokemonsWithForms, newBoxAtGenerations).flatMap((pokemons) => splitArray(pokemons, 30));
}

function isPokemonIncluded(pokemonData: PokemonData, filter: PokemonFilterConfig) {
    if (filter.include.length && !filter.include.some(m => isPokemonMatch(pokemonData, m))) {
        return false;
    }

    if (filter.exclude.some(m => isPokemonMatch(pokemonData, m))) {
        return false;
    }

    return true;
}

function isPokemonMatch(pokemonData: PokemonData, matcher: PokemonMatcher) {
    if (matcher.id) {
        return pokemonData.id === matcher.id
    }

    if (matcher.generation) {
        return pokemonData.id >= matcher.generation.start && pokemonData.id <= matcher.generation.end;
    }

    if (matcher.pokedex) {
        return !!pokemonData.regionalId[matcher.pokedex]
    }

    return false
}