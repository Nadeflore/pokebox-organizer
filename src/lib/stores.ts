import { derived, writable } from 'svelte/store';
import { defaultConfig, type PokemonData, type PokemonFilterConfig } from './box-order-generator/box-order-generator';
import { browser } from '$app/environment';

export interface Tab {
    config: PokemonFilterConfig;
    checked: string[];
}

function fromLocalStorage(storageKey: string, fallbackValue: any, serverFallbackValue?: any) {
    if (!browser) {
        return serverFallbackValue ?? fallbackValue;
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

// compatibility with previous format stored in local storage under keys "config" and "checked"
const stateDefaultValueWithRetroCompat = { activeTabId: 0, tabs: [{ name: "Config 1", config: fromLocalStorage("config", defaultConfig), checked: fromLocalStorage("checked", []) }] }
const tabDefaultValue = { config: defaultConfig, checked: [] } as Tab;

function createState() {
    const { subscribe, set, update } = writable(fromLocalStorage("state", stateDefaultValueWithRetroCompat) as { activeTabId: number, tabs: Tab[] });

    return {
        subscribe,
        set,
        update,
        addTab: () => update(s => ({ activeTabId: s.tabs.length, tabs: [...s.tabs, { ...tabDefaultValue }] })),
        removeTab: (i: number) => update(s => s.tabs.length == 1 ? s : ({ activeTabId: Math.min(s.tabs.length - 2, i), tabs: s.tabs.slice(0, i).concat(s.tabs.slice(i + 1)) })),
    };
}

export const state = createState();
toLocalStorage(state, "state")


function createConfig() {
    const { subscribe } = derived(
        state,
        $tabs => $tabs.tabs[$tabs.activeTabId].config
    );

    return {
        subscribe,
        set: (value: PokemonFilterConfig) => state.update(tabs => {
            tabs.tabs[tabs.activeTabId].config = value;
            return tabs;
        })
    }
};

function createChecked() {
    const { subscribe } = derived(
        state,
        $tabs => $tabs.tabs[$tabs.activeTabId].checked
    );

    return {
        subscribe,
        set: (value: string[]) => state.update(tabs => {
            tabs.tabs[tabs.activeTabId].checked = value;
            return tabs;
        })
    }
};

export const config = createConfig();

export const checked = createChecked();