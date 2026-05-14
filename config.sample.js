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
