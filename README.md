# MMM-AVL

MagicMirror2 module for displaying upcoming AVL waste collection dates from an `.ics` calendar feed.

## Short Description

Fetches the AVL waste calendar, normalizes common waste types and shows the next collection dates on your MagicMirror.

## Features

- Fetches iCalendar (`.ics`) feeds by URL.
- Displays upcoming collection dates with type, date and summary.
- Detects common German waste types: `Restmüll`, `Biomüll`, `Papier`, `Glas`, `Gelber Sack`.
- Keeps the last valid calendar in memory and reuses it if a later fetch fails.
- Supports configurable polling interval, maximum entries and lookahead window.

## Dependencies and APIs

- MagicMirror2.
- Node.js dependencies installed with `npm install`.
- A reachable AVL `.ics` calendar URL.
- No API key is required.

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/LeeChristmas93/MMM-AVL.git
cd MMM-AVL
npm install
```

## Configuration

```js
{
  module: "MMM-AVL",
  position: "top_left",
  header: "Abfallkalender",
  config: {
    url: "https://example.com/avl.ics",
    updateInterval: 12 * 60 * 60 * 1000,
    maximumEntries: 6,
    maximumNumberOfDays: 365,
    fetchOnStart: true,
    showSymbols: true
  }
}
```

## Configuration Options

| Option | Default | Description |
| --- | --- | --- |
| `url` | required | Public or local URL to the AVL `.ics` calendar feed. |
| `updateInterval` | `12 * 60 * 60 * 1000` | Calendar polling interval in milliseconds. |
| `maximumEntries` | `6` | Maximum number of collection dates shown. |
| `maximumNumberOfDays` | `365` | Lookahead window for future collection dates. |
| `fetchOnStart` | `true` | Fetch the calendar immediately when the module starts. |
| `showSymbols` | `true` | Show Font Awesome symbols for detected waste types. |

## Module Files

- `MMM-AVL.js` - frontend rendering and MagicMirror lifecycle.
- `node_helper.js` - background fetch, parser and scheduler.
- `css/mmm-avl.css` - module styling.
- `config.sample.js` - copyable MagicMirror configuration example.

## Development

```bash
npm test
```

The test script runs JavaScript syntax checks and verifies that runtime dependencies can be loaded.

## License

MIT
