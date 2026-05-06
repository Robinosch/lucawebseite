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

Jede Kategorie-Datei ist ein Array aus `AnimalRaw`-Objekten. Bilder werden nur als Ordnerpfad angegeben; die App baut daraus die Bildliste.

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
    "images": "/images/stammkühe/anthea-fox-of-blocken",
    "offspringImages": "/images/stammkühe/anthea-fox-of-blocken/nachwuchs"
  }
]
```

## Bild-Manifest (image-index.json)

Die App kann statische Verzeichnisse nicht dynamisch auflisten. Deshalb gibt es ein Manifest:

- `image-index.json` mappt Ordnerpfade auf Dateinamen.
- Die App erzeugt daraus `alt`, `placeholder`, `isPrimary` und `size`.
- Dateien mit `abstammungstabelle` werden als Abstammungsbild erkannt.

Beispielauszug:

```json
{
  "/images/stammkühe/anthea-fox-of-blocken": [
    "anthea-fox-of-blocken-abstammungstabelle.jpg",
    "picture-2600.jpg",
    "picture-200 (1).jpeg"
  ]
}
```

## Hinweis zur Migration

Solange die JSON-Dateien leer sind, nutzt die App weiterhin die bisherigen In-Memory-Daten im `AnimalService`.
Sobald du Daten in die JSON-Dateien eintraegst, werden diese automatisch geladen und verwendet.
