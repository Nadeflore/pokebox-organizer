import pokemons from '../data/out.json';

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

export interface Pokemon {
    id: number;
    imageName: string;
    name: string;
    region?: Region;
    formIds: number[];
    sex: string;
    sexes: string[];
    sexForm?: boolean;
    multipleForms: boolean;
    event: boolean;
}

interface FormData {
    id: number;
    sex: string;
    region?: Region;
    event?: boolean;
}

interface PokemonData {
    forms: FormData[];
    formType: "NORMAL" | "CHANGE_LEG" | "CHANGE" | "SEX";
    id: number;
    name: string;
}

function getPokemonList(maleFemaleForms: boolean, types: FormType[]): Pokemon[] {
    const result = (pokemons as PokemonData[]).flatMap((pokemon) => {
        const formType = FormType[pokemon.formType as keyof typeof FormType]

        let forms = pokemon.forms
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
                imageName: getImageFileName(pokemon.id, form.id, form.sex),
                name: pokemon.name,
                formIds: [form.id],
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
                    sexes: [...new Set(a.sexes.concat(b.sexes))],
                }))]
            }
        }

        return eventAndRegionalForms.concat(otherForms)
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

export function getPokemonBoxes(maleFemaleForms: boolean, event: boolean, types: FormType[]): Pokemon[][] {
    const pokemons = getPokemonList(maleFemaleForms, types).filter(p => event || !p.event);

    const nonRegionalForms = pokemons.filter(p => !p.region)
    const regionalFormsByRegion = Object.values(Region).map(region => pokemons.filter(p => p.region == region))

    const groups = splitByGeneration(nonRegionalForms).concat(regionalFormsByRegion);

    return groups.flatMap((pokemons) => splitArray(pokemons, 30));
}