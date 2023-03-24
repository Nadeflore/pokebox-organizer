import csv

with open('data.csv', newline='') as csvfile:
    data = csv.DictReader(csvfile)

    pokemons = {p["name_en"]: p for p in data}


with open('hisui.csv', newline='') as csvfile:
    hisui = csv.DictReader(csvfile)

    for p in hisui:
        pokemon = pokemons[p["name"]]
        pokemon["la"] = p["id"]

    print(pokemons)

with open('pokemondata.csv', 'w') as f:
    w = csv.DictWriter(f, pokemons["Ninetales"].keys())
    w.writeheader()
    for entry in pokemons.values():
        if "la" not in entry:
            entry["la"] = None

        w.writerow(entry)





    

