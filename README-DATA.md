To Update the data

Add new pokemons info to `tools/pokemonsdata.csv
If there is a new pokedex, add a new collumn with the key for this pokdedex as header

If there are new named forms, add them to `tools/formnames.csv`

Run `tools/generate_pokemons.py`, this will generate `static/data/pokemons.json`

Update `src/lib/data/generations.json` even if there is no new generations, to at least update the end of the generation to which pokemons were added

Update `src/lib/data/pokedexes.json` if you added a new pokedex to add the localized names of this pokedex

Run `tools/resizeImages.py` to create the ressources images used by the app

In case restart the serve to be sure the resources file are up to date
