
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
    region?: Region;
    formIds: number[];
    formNames: LocalizedName[];
    sex: string;
    sexes: string[];
    sexForm?: boolean;
    multipleForms: boolean;
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
    regionalId: object
}

function getPokemonList(pokemonsData: PokemonData[], maleFemaleForms: boolean, types: FormType[], specialMode: string): Pokemon[] {

    // Special filter and sort
    // let pokemons = pokemonsData.filter(p => p.regionalId.swsh && p.id < 810 && !p.forms.find(f => f.region == Region.GALAR));
    // pokemons.sort((a, b) => a.regionalId.swsh - b.regionalId.swsh)
    let pokemons = pokemonsData
    if (specialMode == "hisui") {
        pokemons = pokemons.filter(p => p.regionalId.la && p.id < 899 && p.id != 550 && !(p.id >= 387 && p.id <= 493) && !p.forms.find(f => f.region == Region.HISUI));
        pokemons.sort((a, b) => a.regionalId.la - b.regionalId.la)
    } else if (specialMode == "paldea") {
        pokemons = pokemons.filter(p => p.regionalId.sv && p.id != 128 && p.id != 194);
        pokemons.sort((a, b) => a.regionalId.sv - b.regionalId.sv)
    }

    const result = (pokemons as PokemonData[]).flatMap((pokemon) => {
        const formType = FormType[pokemon.formType as keyof typeof FormType]

        const forms = pokemon.forms
            .flatMap((form: FormData) => {
                switch (form.sex) {
                    case 'fd':
                        if (maleFemaleForms) {
                            return [{ ...form, sex: 'md', sexes: [Sex.M], sexForm: true }, { ...form, sexes: [Sex.F], sexForm: true }];
                        } else {
                            return [{ ...form, sexes: [Sex.M, Sex.F] }];
                        }
                    case 'mf':
                        return [{ ...form, sexes: [Sex.M, Sex.F] }];
                    case 'mo':
                        return [{ ...form, sexes: [Sex.M] }];
                    case 'fo':
                        return [{ ...form, sexes: [Sex.F] }];
                    case 'uk':
                        return [{ ...form, sexes: [] }];
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
        const eventAndRegionalForms = forms.filter(form => form.event || form.region)
        let otherForms = forms.filter(form => !form.event && !form.region)

        if (formType) {
            if (types.includes(formType)) {
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


function splitByGeneration(pokemons: Pokemon[]) {
    const splits = [1, 152, 252, 387, 494, 650, 722, 810];
    return splits.map((start, i, array) => {
        const end = array[i + 1];
        const startIndex = pokemons.findIndex((p) => p.id >= start);
        const endIndex = end ? pokemons.findIndex((p) => p.id >= end) : pokemons.length;

        return pokemons.slice(startIndex, endIndex);
    });
}

export function getPokemonBoxes(pokemonsData: PokemonData[], maleFemaleForms: boolean, event: boolean, types: FormType[], specialMode: string): Pokemon[][] {
    const pokemons = getPokemonList(pokemonsData, maleFemaleForms, types, specialMode).filter(p => (event || !p.event) && (!specialMode || !p.region));

    const nonRegionalForms = pokemons.filter(p => !p.region)
    const regionalFormsByRegion = Object.values(Region).map(region => pokemons.filter(p => p.region == region))

    const nregforms = specialMode ? [nonRegionalForms] : splitByGeneration(nonRegionalForms);
    const groups = nregforms.concat(regionalFormsByRegion);

    return groups.flatMap((pokemons) => splitArray(pokemons, 30));
}