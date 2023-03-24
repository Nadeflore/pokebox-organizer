import requests
import json

pokemons = {}

for id in range(1,905):
    print(id)
    pokemon = requests.get('https://pokeapi.co/api/v2/pokemon/{}'.format(id)).json()

    if len(pokemon["forms"]) > 1:
        forms = []
        for form in pokemon["forms"]:
            forminfo = requests.get(form["url"]).json()
            formNames = {names["language"]["name"]: names["name"] for names in forminfo["form_names"]}
            print(formNames)
            forms.append(formNames)

        pokemons[id] = forms


print(pokemons)
with open("formnames.json", "w") as jsonfile:
    jsonfile.write(
        json.dumps(
            pokemons,
            indent=4,
            ensure_ascii=False,
        )
    )

