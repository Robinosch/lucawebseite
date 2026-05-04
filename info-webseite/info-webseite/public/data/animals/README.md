# Tierdaten (JSON)

Die App kann Tierdaten aus JSON-Dateien laden. Das ist ideal fuer die Pflege durch Nicht-Entwickler.

## Ordnerstruktur

```
public/
  data/
    animals/
      categories.json
      stammkuehe.json
      mutterkuehe.json
      zuchtbullen.json
      kaelber.json
      faersen.json
      jungbullen.json
```

## Kategorien

`categories.json` enthaelt die Karten fuer "/unsere-highlander". Jede Kategorie hat u. a. `slug`, `label`, `description`, `icon` und `routerLink`.

## Tiere

Jede Kategorie-Datei ist ein Array aus `Animal`-Objekten. Beispiel:

```json
[
  {
    "id": "anthea-fox-of-blocken",
    "name": "Anthea Fox of Blocken",
    "category": "stammkuehe",
    "birthDate": "04.09.1997",
    "origin": "Fox of Blocken (schottische Abstammung)",
    "status": "Stammkuh",
    "description": "Kurzbeschreibung...",
    "offspring": "Optionaler Text",
    "images": [
      {
        "placeholder": "Anthea Fox of Blocken",
        "alt": "Anthea Fox of Blocken – Hauptbild",
        "isPrimary": true,
        "src": "images/stammkühe/anthea-fox-of-blocken/picture-2600.jpg",
        "size": "large"
      }
    ],
    "lineageImageSrc": "images/stammkühe/anthea-fox-of-blocken/anthea-fox-of-blocken-abstammungstabelle.jpg",
    "offspringImages": [
      {
        "placeholder": "Nachwuchs",
        "alt": "Nachwuchs Anthea – Bild 1",
        "isPrimary": true,
        "src": "images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600.jpg",
        "size": "medium"
      }
    ]
  }
]
```

## Hinweis zur Migration

Solange die JSON-Dateien leer sind, nutzt die App weiterhin die bisherigen In-Memory-Daten im `AnimalService`.
Sobald du Daten in die JSON-Dateien eintraegst, werden diese automatisch geladen und verwendet.

