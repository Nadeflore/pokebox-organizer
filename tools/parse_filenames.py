import os
import sys
import re
import json

from itertools import groupby

from dataclasses import dataclass
from enum import Enum

import cv2
FOLDER_PATH = '../../../Downloads/[HOME] Pokémon Renders v200/Normal'

class Sex(Enum):
    uk = 1
    mf = 2
    fd = 3
    md = 4
    fo = 5
    mo = 6


class FormType(Enum):
    NORMAL = 1 
    IGNORE = 2
    MEGA = 3
    ALOLA = 4
    GALAR = 5
    HISUI = 6
    EVENT = 7
    SEX = 8
    CHANGE = 9
    CHANGE_LEG = 10
    CHANGE_TEMP = 11

@dataclass
class PokemonPicture:
    """Class with info for a specific pokemon picture."""
    filename: str
    dex_id: int
    form_id: int
    sex: Sex
    giga: bool
    form2_id: int
    back: bool

    @staticmethod
    def from_filename(filename: str):
        match = re.fullmatch(r"poke_capture_(?P<id>\d{4})_(?P<form>\d{3})_(?P<sex>uk|mf|fd|md|fo|mo)_(?P<giga>n|g)_(?P<form2>\d{8})_(?P<orientation>f|b)_n.png", filename)
        return  PokemonPicture(filename, int(match.group("id")), int(match.group("form")), Sex[match.group("sex")], match.group("giga") == "g", int(match.group("form2")), match.group("orientation") == "b")


def append_to_file(filename, value):
    with open(filename, "a") as f:
        f.write("\n" + value)

# Open Pokemon data
import csv

with open('pokemondata.csv', newline='') as csvfile:
    cf = csv.DictReader(csvfile) 

    pokemon_data_by_id = {}
    for pokemondata in cf:
        #pokemon_names_by_id = {int(e['id']): e['name_fr'] for e in cf}
        id = int(pokemondata["national"])
        if id not in pokemon_data_by_id:
            pokemon_data_by_id[id] = {"id": id}

        namei18n = {}
        for lang, name in pokemondata.items():
            if lang.startswith("name_") and name:
                namei18n[lang[5:]] = name

        pokemon_data_by_id[id]["name"] = namei18n

        regionalId = {}
        for region, number in pokemondata.items():
            if not region.startswith("name_") and number:
                regionalId[region] = int(number)

        pokemon_data_by_id[id]["regionalId"] = regionalId


print(str(pokemon_data_by_id))

with open('forms_info', newline='') as csvfile:
    cf = csv.DictReader(csvfile, delimiter=";", fieldnames=['id', 'form_type'])

    forms_info = {e['id']: FormType[e['form_type']] for e in cf}
    # print(str(forms_info))

form_names = {}
with open('formnames.csv', newline='') as csvfile:
    cf = csv.DictReader(csvfile)

    for formname in cf:
        id = int(formname["id"])
        form_id = int(formname["formId"])
        if id not in form_names:
            form_names[id] = {}

        namei18n = {}
        for lang, name in formname.items():
            if lang not in ["id", "formId"] and name:
                namei18n[lang] = name

        form_names[id][form_id] = namei18n

print(form_names)


# Get images filenames
filenames = os.listdir(FOLDER_PATH)

pictures = [PokemonPicture.from_filename(filename) for filename in filenames]
pictures.sort(key=lambda pic: pic.dex_id)

pokemons_json = []

for dex_id, forms in groupby(pictures, key=lambda pic: pic.dex_id):
    if dex_id == 0:
        continue

    # Remove gigamax and back images
    forms = list(filter(lambda e: not e.giga and not e.back, forms))

    forms.sort(key=lambda e: e.form_id)
    # print("Pokemon {}".format(pokemon_names_by_id[dex_id]))

    forms_json = []

    subFormsByFormId = {form_id : list(subforms) for form_id, subforms in groupby(forms, key=lambda e: e.form_id) if forms_info.get("{}_{}".format(dex_id, form_id)) not in [FormType.MEGA, FormType.IGNORE, FormType.CHANGE_TEMP]}

    pokemonFormType = None
    normalCount = 0

    # print(subFormsByFormId)
    for form_id, subforms in subFormsByFormId.items():
        subforms = list(subforms)
        # print(subforms)
        sexes = [subform.sex for subform in subforms]
        
        if len(sexes) != len(set(sexes)):
            print("### duplicate sex value")
            sexes = list(set(sexes))

        if len(sexes) == 1:
            sex = sexes[0]
            if sex in [Sex.fd, Sex.md]:
                raise Exception("missing double sex form")

        elif len(sexes) == 2:
            if not (Sex.fd in sexes and Sex.md in sexes):
                raise Exception("double but not each sex")

            sex = Sex.fd

        else:
            raise Exception("unexpected sex size")


        # print("form {}, sex {}".format(form_id, sex))

        dexform = "{}_{}".format(dex_id, form_id)

        if dexform in forms_info:
            info = forms_info[dexform]
        elif len(subFormsByFormId) == 1:
            info = None
        else:

            img = cv2.imread(FOLDER_PATH + "/" + subforms[0].filename, cv2.IMREAD_ANYCOLOR)
            cv2.imshow("p", img)
            cv2.setWindowTitle("p", "{} - {}".format(dex_id, subforms[0].filename))
            key = cv2.waitKey(0)

            print("Pressed {}".format(key))

            info = None
            if key == 27:
                raise Exception("Exit")
            elif key == ord('m'):
                info = FormType.MEGA
            elif key == ord('a'):
                info = FormType.ALOLA
            elif key == ord('g'):
                info = FormType.GALAR
            elif key == ord('h'):
                info = FormType.HISUI
            elif key == ord('i'):
                info = FormType.IGNORE
            elif key == ord(' '):
                info = FormType.NORMAL
            elif key == ord('e'):
                info = FormType.EVENT
            elif key == ord('s'):
                info = FormType.SEX
            elif key == ord('c'):
                info = FormType.CHANGE
            elif key == ord('l'):
                info = FormType.CHANGE_LEG
            elif key == ord('t'):
                info = FormType.CHANGE_TEMP

            if info:
                append_to_file("forms_info", "{}_{};{}".format(dex_id, form_id, info.name))

            else:
                info = FormType.NORMAL

        form_json = {"id": form_id, "sex": sex.name, }


        if info:
            if info in [FormType.SEX, FormType.CHANGE, FormType.CHANGE_LEG]:
                if pokemonFormType and pokemonFormType != info:
                    raise Exception("Pokemon with conflicting forms {}".format(dex_id))

                pokemonFormType = info
            elif info == FormType.NORMAL:
                normalCount += 1
            elif info in [FormType.ALOLA, FormType.GALAR, FormType.HISUI]:   
                form_json["region"] = info.name
            elif info == FormType.EVENT:
                form_json["event"] = True

            # add form info
            form_names_for_pokemon = form_names.get(dex_id)
            if form_names_for_pokemon and form_names_for_pokemon.get(form_id):
                form_json["name"] = form_names_for_pokemon[form_id]
            elif not form_json.get("region"):
                print("Missing form name for {} form {}".format(dex_id, form_id))


        forms_json.append(form_json)


    pokemonJson = pokemon_data_by_id[dex_id]
    if forms_json:
        pokemonJson["forms"] = forms_json


    if normalCount > 1:
        if pokemonFormType:
            raise Exception("Pokemon with normal and other forms {}".format(dex_id))
        pokemonFormType = FormType.NORMAL

    if pokemonFormType:
        pokemonJson["formType"] = pokemonFormType.name

    pokemons_json.append(pokemonJson)



cv2.destroyAllWindows()

# print(str(pokemons_json))

with open("out.json", "w") as jsonfile:
    jsonfile.write(
        json.dumps(
            pokemons_json,
            indent=4,
            ensure_ascii=False,
        )
    )



