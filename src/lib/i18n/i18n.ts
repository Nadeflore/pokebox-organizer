import { derived } from "svelte/store";
import { locale } from "../stores";
import { type LocalizedName } from "$lib/box-order-generator/box-order-generator";

interface LangFile {
    name: string;
    texts: Record<string, Record<string, string>>;
}

const translations: Record<string, LangFile> = import.meta.glob('./translations/*.json', { eager: true })

export const locales = Object.keys(translations).map(p => ({key: p.replace("./translations/", "").replace(".json", ""), name: translations[p].name}));

function translate(locale: string, key: string, vars: Record<string, string>) {

    if (!key.includes(".")) {
        console.warn(`Invalid key ${key}`)
        return key;
    }

    const [topKey, subKey] = key.split(".", 2);
    let text = translations[`./translations/${locale}.json`]?.texts[topKey]?.[subKey];

    if (!text)  {
        console.warn(`No translation found for ${key} ${Object.entries(vars).map(([key, value]) => `${key}: ${value}`).join(', ')} in locale ${locale}`)
        return key;
    }

    Object.entries(vars).forEach(([key, value]) => {
        text = text.replaceAll(`{{${key}}}`, value)
    })

    return text;
}


export const t = derived(locale, ($locale) => (key: string, vars = {} as Record<string, string>) =>
    translate($locale, key, vars)
);

export const tl = derived(locale, ($locale) => (localizedName: LocalizedName | undefined) => 
    localizedName ? localizedName[$locale] || localizedName['en'] : ""
    );
