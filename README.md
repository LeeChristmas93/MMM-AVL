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
# MMM-AVL

Short description: AVL Waste Calendar for MagicMirror — fetches `.ics` feeds and displays upcoming collection dates.

MagicMirror module to display AVL waste collection dates via an `.ics` feed.

## Installation
1. Copy the `modules/MMM-AVL` directory into your MagicMirror `modules` folder.
2. Install dependencies inside the module folder:

```bash
cd modules/MMM-AVL
npm install
```

3. Add a configuration fragment to your `config.js` (example):

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

## Module files
- `MMM-AVL.js` — frontend (DOM rendering)
- `node_helper.js` — background: fetch, parser, scheduler
- `module.json` — module metadata
- `package.json` — node dependencies

## Notes
- If your provider only offers a one-time download (no subscription), set up an external script to periodically update the `.ics` file.
