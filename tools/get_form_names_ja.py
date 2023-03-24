import requests
import json
import re


with open('formnames.json', 'rt') as f:
    form_names = json.load(f)

for id in range(1, 1009):
    print(id)
    page = requests.get('https://zukan.pokemon.co.jp/detail/{}'.format(str(id).zfill(4))).text

    jsoninfo = re.search('<script id="json-data" type="application/json">(.*)</script>', page).group(1)

    pokemoninfo = json.loads(jsoninfo)

    forms = pokemoninfo["groups"]
    print(forms)

    # filter out gigamax
    forms = list(filter(lambda f: not f["kyodai_flg"], forms))

    if len(forms) == 0:
        continue

    # add form name to existing file
    if str(id) not in form_names:
        form_names[str(id)] = []

    for form in forms:
        formid = form["sub"]

        if len(form_names[str(id)]) <= formid:
            form_names[str(id)].append({})


        formname = form["sub_name"]

        if not formname:
            formname = form["name"]

        form_names[str(id)][formid]["ja"] = formname


    # save forms
    with open("formnames.json", "w") as jsonfile:
        jsonfile.write(
            json.dumps(
                form_names,
                indent=4,
                ensure_ascii=False,
            )
        )

