# Highlander vom Weetfeld

Informations- und Präsentationswebsite für die Zuchtstätte **Highlander vom Weetfeld** in Hamm-Weetfeld. Die Website stellt die schottischen Hochlandrinder, die Haltung auf dem Bio-Betrieb sowie die Fleisch-Direktvermarktung vor und bietet Interessierten Informationen zu Besuchen, Beratung und Kontaktmöglichkeiten.

Die Anwendung ist als moderne Single-Page-Webanwendung umgesetzt und wird aktuell unter [lucawebseite.vercel.app](https://lucawebseite.vercel.app) bereitgestellt.

## Hintergrund

Das Projekt verbindet die Präsentation des landwirtschaftlichen Betriebs mit einer übersichtlichen digitalen Tierverwaltung. Besucherinnen und Besucher können sich unter anderem über folgende Themen informieren:

- die verschiedenen Highlander-Kategorien wie Stammkühe, Mutterkühe, Zuchtbullen, Kälber und Jungtiere
- einzelne Tiere mit Bildern, Herkunft und weiteren Informationen
- den interaktiven Stammbaum
- Bio-Haltung und den Alltag auf dem Betrieb
- Fleischqualität, Verarbeitung und Direktvermarktung
- Besuch, Beratung und Kontakt

Die Tierdaten und Bildzuordnungen werden möglichst außerhalb der Angular-Komponenten in JSON-Dateien und einem Bild-Manifest gepflegt. Dadurch können Inhalte aktualisiert werden, ohne die gesamte Darstellungslogik ändern zu müssen.

## Technologie

Das Projekt verwendet folgende zentrale Technologien:

- **Angular 21** als Framework für die Webanwendung
- **TypeScript** für die Anwendungslogik und die typisierte Datenverarbeitung
- **HTML** für die Struktur und Inhalte der einzelnen Seiten
- **CSS/SCSS** für Layout, Responsive Design und das visuelle Erscheinungsbild
- **Angular Material und Angular CDK** für UI-Komponenten und Hilfsfunktionen
- **RxJS** für reaktive Datenverarbeitung innerhalb der Angular-Anwendung
- **D3.js** für datenbasierte Visualisierungen, insbesondere den interaktiven Stammbaum
- **Vitest** beziehungsweise Angulars Unit-Test-Konfiguration für Tests
- **npm** für Abhängigkeiten und Skripte

Die Anwendung nutzt Angulars Standalone-Architektur. Seiten werden über das Angular-Routing organisiert und bei Bedarf per Lazy Loading geladen. Das reduziert die initiale Ladegröße und strukturiert die Anwendung in unabhängige Funktionsbereiche.

## Projektstruktur

Der eigentliche Angular-Arbeitsbereich befindet sich unter `info-webseite/info-webseite`.

```text
info-webseite/
└── info-webseite/
    ├── public/
    │   ├── data/animals/       # Tierdaten und Kategorien als JSON
    │   └── images/             # Bilder der Tiere und des Betriebs
    ├── src/
    │   ├── app/
    │   │   ├── pages/          # Seitenbereiche wie Startseite, Kontakt und Stammbaum
    │   │   ├── shared/         # Wiederverwendbare Komponenten und Services
    │   │   ├── app.config.ts   # Globale Angular-Konfiguration
    │   │   └── app.routes.ts   # Routen und Lazy-Loading-Konfiguration
    │   ├── material-theme.scss  # Angular-Material-Theme
    │   ├── styles.css          # Globale Styles
    │   └── index.html          # HTML-Einstiegspunkt
    ├── tools/                  # Hilfsskripte, z. B. für das Bild-Manifest
    ├── angular.json
    ├── package.json
    └── tsconfig.json
```

## Lokale Entwicklung

### Voraussetzungen

- Node.js in einer für Angular 21 geeigneten Version
- npm 11 oder kompatibel

### Installation

```bash
cd info-webseite/info-webseite
npm install
```

### Entwicklungsserver starten

```bash
npm start
```

Danach ist die Anwendung normalerweise unter [http://localhost:4200](http://localhost:4200) erreichbar. Änderungen an den Quelldateien werden während der Entwicklung automatisch übernommen.

## Build und Tests

### Produktions-Build

```bash
npm run build
```

Vor dem Angular-Build wird automatisch das Bild-Manifest erzeugt. Die fertigen Dateien werden im Angular-Standardverzeichnis `dist/` abgelegt.

### Entwicklungs-Build mit Dateiüberwachung

```bash
npm run watch
```

### Unit-Tests

```bash
npm test
```

## Pflege der Tierdaten

Tierdaten werden unter `info-webseite/info-webseite/public/data/animals/` als JSON-Dateien verwaltet. Die Dateien enthalten unter anderem Kategorien, Namen, Geburtsdaten, Herkunft, Status, Beschreibungen und Bildpfade.

Die Anwendung verwendet außerdem ein `image-index.json`, da statische Verzeichnisse im Browser nicht automatisch aufgelistet werden können. Das Manifest ordnet Bildordnern die darin enthaltenen Dateinamen zu und wird über das Skript `build:image-index` erzeugt.

Neue oder geänderte Tierdaten sollten deshalb zusammen mit den zugehörigen Bildern und dem anschließenden Build geprüft werden.

## Gestaltung

Das visuelle Konzept orientiert sich an der natürlichen und landwirtschaftlichen Umgebung des Betriebs. Die Website verwendet eine ruhige, klar lesbare Gestaltung mit eigenen Typografie- und Farbdefinitionen sowie responsiven Layouts für Desktop- und mobile Geräte. Google Fonts und Google Material Icons werden im HTML-Einstiegspunkt eingebunden.

## Status

Das Projekt befindet sich in aktiver Entwicklung. Inhalte, Tierdaten und Bildmaterial können laufend ergänzt oder aktualisiert werden.

## Lizenz

Für dieses Repository ist derzeit keine gesonderte Open-Source-Lizenz hinterlegt. Eine Nutzung, Weitergabe oder Übernahme von Quellcode, Texten und Bildmaterial sollte daher vorher mit dem Projektinhaber abgestimmt werden.
