import subprocess
import json


INPUT_PATH = "../../../Downloads/[HOME] Pokémon Renders v200/Normal"

OUTPUT_PATH = "../static/images/pokemons"


def get_image_file_name(pokemon_id: int, form_id: int, sex: str) -> str:
    return f"poke_capture_{str(pokemon_id).zfill(4)}_{str(form_id).zfill(3)}_{sex}_n_00000000_f_n"



with open('out.json', "rt") as jsonfile:
    pokemons = json.load(jsonfile)

    imagesFileNames = []

    for pokemon in pokemons:
        for form in pokemon["forms"]:

            imagesFileNames.append(get_image_file_name(pokemon["id"], form["id"], form["sex"]))
            
            if form["sex"] == "fd":
                imagesFileNames.append(get_image_file_name(pokemon["id"], form["id"], "md"))




for filename in imagesFileNames:
    subprocess.run([
        "convert",
        INPUT_PATH + "/" + filename + ".png",
        "-resize",
        "128x128",
        OUTPUT_PATH + "/" + filename + ".webp"
        ])
