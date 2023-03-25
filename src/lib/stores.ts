import { writable } from 'svelte/store';
import { defaultConfig, type PokemonData, type PokemonFilterConfig } from './box-order-generator/box-order-generator';
import { browser } from '$app/environment';

function fromLocalStorage(storageKey: string, fallbackValue: any, serverFallbackValue: any) {
    if (!browser) {
        return serverFallbackValue;
    }

    const storedValue = window.localStorage.getItem(storageKey)

    if (storedValue !== 'undefined' && storedValue !== null) {
        return (typeof fallbackValue === 'object')
            ? JSON.parse(storedValue)
            : storedValue
    }
    return fallbackValue;
}

function toLocalStorage(store, storageKey: string) {
    if (browser) {
        store.subscribe(value => {
            let storageValue = (typeof value === 'object')
                ? JSON.stringify(value)
                : value

            window.localStorage.setItem(storageKey, storageValue)
        })
    }
}


export const pokemonsData = writable([] as PokemonData[]);

export const config = writable(fromLocalStorage("config", defaultConfig, { ...defaultConfig, pokedex: '' }) as PokemonFilterConfig)
toLocalStorage(config, "config")

export const checked = writable(fromLocalStorage("checked", [], []) as string[])
toLocalStorage(checked, "checked")