# MMM-AVL

MagicMirror Modul zur Anzeige des AVL-Abfallkalenders via `.ics`-Feed.

# MMM-AVL

Kurzbeschreibung: AVL Abfallkalender für MagicMirror — lädt `.ics`-Feeds und zeigt die nächsten Abfuhrtermine an.

MagicMirror Modul zur Anzeige des AVL-Abfallkalenders via `.ics`-Feed.

## Installation
1. Kopiere das Verzeichnis `modules/MMM-AVL` in dein MagicMirror `modules`-Verzeichnis.
2. Installiere Abhängigkeiten im Modulordner:

```bash
cd modules/MMM-AVL
npm install
```

3. Füge ein Konfigurationsfragment in deiner `config.js` hinzu (Beispiel):

```js
{
  module: "MMM-AVL",
  position: "top_left",
  config: {
    url: "https://example.com/avl.ics",
    updateInterval: 1000 * 60 * 60 * 12,
    maximumEntries: 6,
    maximumNumberOfDays: 365
  }
}
```

## Beschreibung
- `node_helper.js` lädt das `.ics`-File per HTTP(S), parsed es mit `node-ical` und sendet Events an das Frontend.
- beim Fehler wird die letzte gültige `.ics` (falls vorhanden) als Fallback genutzt.

## Konfiguration
- `url` (string, required): URL oder lokaler Pfad zur `.ics`-Datei
- `updateInterval` (ms): Intervall für automatische Aktualisierung
- `maximumEntries` (int): Anzahl der anzuzeigenden Einträge
- `maximumNumberOfDays` (int): wie viele Tage in die Zukunft betrachtet werden

## Moduldateien
- `MMM-AVL.js` — Frontend (DOM-Rendering)
- `node_helper.js` — Hintergrundprozess: Fetch, Parser, Scheduler
- `module.json` — Modul-Metadaten
- `package.json` — Node-Abhängigkeiten

## Hinweise
- Wenn dein Provider nur einen Download (kein Abo) anbietet: richte ein externes Skript ein, das die `.ics` periodisch aktualisiert.


- Wenn dein Provider nur einen Download (kein Abo) anbietet, richte ein externes Skript ein, das die `.ics` periodisch aktualisiert.
