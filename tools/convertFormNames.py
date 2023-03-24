import json
import csv


with open('newformnames.json', 'rt') as f:
    form_names = json.load(f)

entries = []
for id, forms in form_names.items():

    for formId, form in enumerate(forms):
        entry = {
            "id": id,
            "formId": formId
            }

        for lang in ["ja", "en", "fr", "de", "es", "it", "ko", "zh-Hant", "zh-Hans"]:
            entry[lang] = form.get(lang)

        entries.append(entry)

with open('formnames.csv', 'w') as f:
    w = csv.DictWriter(f, entries[0].keys())
    w.writeheader()
    for entry in entries:
        w.writerow(entry)
