import requests
import json
import re


def isKeep(form):
    name = form.get("ja")
    if not name:
        return True

    if name.startswith("メガ"):
        return False

    if name in ["アローラのすがた", "ガラルのすがた", "ヒスイのすがた"]:
        return False

    return True


with open('formnames.json', 'rt') as f:
    form_names = json.load(f)

print(form_names)

new_form_names = {}
for id, forms in form_names.items():

    filtered_forms = list(filter(isKeep, forms))

    if len(filtered_forms) > 1:
        new_form_names[id] = filtered_forms


# save forms
with open("newformnames.json", "w") as jsonfile:
    jsonfile.write(
        json.dumps(
            new_form_names,
            indent=4,
            ensure_ascii=False,
        )
    )

