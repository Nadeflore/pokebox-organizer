import subprocess
import json


INPUT_PATH = "../../imagespokemons/[HOME] Pokémon Renders/Normal"

OUTPUT_PATH = "../static/images/pokemons"


def get_image_file_name(pokemon_id: int, form_id: int, sex: str, gigamax: bool = False, form_id2: int = 0) -> str:
    return f"poke_capture_{str(pokemon_id).zfill(4)}_{str(form_id).zfill(3)}_{sex}_{'g' if gigamax else 'n'}_{str(form_id2).zfill(8)}_f_n"



with open('../static/data/pokemons.json', "rt") as jsonfile:
    pokemons = json.load(jsonfile)

    imagesFileNames = []

    for pokemon in pokemons:
        for form in pokemon["forms"]:

            imagesFileNames.append(get_image_file_name(pokemon["id"], form["id"], form["sex"]))

            if form["sex"] == "fd":
                imagesFileNames.append(get_image_file_name(pokemon["id"], form["id"], "md"))


            if pokemon["id"] == 869:
                for formId2 in range(1,7):
                    imagesFileNames.append(get_image_file_name(pokemon["id"], form["id"], form["sex"], False, formId2))

            if form.get("gigantamax"):
                imagesFileNames.append(get_image_file_name(pokemon["id"], form["id"], form["sex"] if form["sex"] != "fd" else "mf", True))
                


            


for filename in imagesFileNames:
    print(filename)
    subprocess.run([
        "magick",
        INPUT_PATH + "/" + filename + ".png",
        "-resize",
        "128x128",
        OUTPUT_PATH + "/" + filename + ".webp"
        ])
