/* Node helper for MMM-AVL
 * Fetches an iCalendar feed, parses upcoming waste collection events and
 * schedules periodic refreshes.
 */

const NodeHelper = require("node_helper");
const axios = require("axios");
const ical = require("node-ical");

const MODULE_NAME = "MMM-AVL";
const DEFAULT_UPDATE_INTERVAL = 12 * 60 * 60 * 1000;
const DEFAULT_MAXIMUM_ENTRIES = 6;
const DEFAULT_MAXIMUM_DAYS = 365;
const REQUEST_TIMEOUT = 20000;

module.exports = NodeHelper.create({
  start() {
    this.config = {};
    this.timer = null;
    this.lastValidIcs = null;

    console.log("[" + MODULE_NAME + "] Node helper started.");
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "AVL_CONFIG") {
      this.config = payload || {};
      return;
    }

    if (notification === "AVL_FETCH") {
      this.setupAndFetch();
    }
  },

  setupAndFetch() {
    if (!this.config.url) {
      this.sendError("Keine Kalender-URL konfiguriert.");
      return;
    }

    this.fetchCalendar();
    this.scheduleFetch();
  },

  scheduleFetch() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const interval = Number(this.config.updateInterval) || DEFAULT_UPDATE_INTERVAL;
    this.timer = setInterval(() => this.fetchCalendar(), interval);
  },

  async fetchCalendar() {
    try {
      const response = await axios.get(this.config.url, {
        responseType: "text",
        timeout: REQUEST_TIMEOUT
      });
      const ics = response.data;
      const events = this.parseCalendar(ics);

      this.lastValidIcs = ics;
      this.sendSocketNotification("AVL_EVENTS", { events });
    } catch (error) {
      this.sendError(error.message);
      this.sendFallbackEvents();
    }
  },

  sendFallbackEvents() {
    if (!this.lastValidIcs) {
      return;
    }

    try {
      this.sendSocketNotification("AVL_EVENTS", {
        events: this.parseCalendar(this.lastValidIcs)
      });
    } catch (error) {
      console.warn("[" + MODULE_NAME + "] Failed to parse cached ICS:", error.message);
    }
  },

  parseCalendar(data) {
    const parsed = ical.parseICS(data);
    const now = this.startOfDay(new Date());
    const maxDays = Number(this.config.maximumNumberOfDays) || DEFAULT_MAXIMUM_DAYS;
    const maxEntries = Number(this.config.maximumEntries) || DEFAULT_MAXIMUM_ENTRIES;
    const latestDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);

    return Object.keys(parsed)
      .map((key) => parsed[key])
      .filter((entry) => entry && entry.type === "VEVENT" && entry.start)
      .map((entry) => this.normalizeEvent(entry))
      .filter((event) => event.start >= now && event.start <= latestDate)
      .sort((a, b) => a.start - b.start)
      .slice(0, maxEntries)
      .map((event) => ({
        summary: event.summary,
        date: this.formatDate(event.start),
        type: event.type,
        start: event.start.toISOString()
      }));
  },

  normalizeEvent(entry) {
    const summary = this.normalizeSummary(entry.summary);

    return {
      summary,
      start: new Date(entry.start),
      type: this.detectWasteType(summary)
    };
  },

  normalizeSummary(summary) {
    if (!summary) {
      return "";
    }

    if (typeof summary === "string") {
      return summary.trim();
    }

    if (summary.val) {
      return String(Array.isArray(summary.val) ? summary.val[0] : summary.val).trim();
    }

    if (Array.isArray(summary)) {
      return String(summary[0] || "").trim();
    }

    return String(summary).trim();
  },

  detectWasteType(summary) {
    const text = summary.toLowerCase();

    if (text.includes("rest") || text.includes("restm")) {
      return "Restmüll";
    }

    if (text.includes("bio") || text.includes("biom")) {
      return "Biomüll";
    }

    if (text.includes("papier") || text.includes("papiertonne")) {
      return "Papier";
    }

    if (text.includes("glas")) {
      return "Glas";
    }

    if (text.includes("gelb") || text.includes("plast") || text.includes("verpack")) {
      return "Gelber Sack";
    }

    return "Sonstiges";
  },

  startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },

  formatDate(date) {
    return new Intl.DateTimeFormat("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    }).format(date);
  },

  sendError(message) {
    console.warn("[" + MODULE_NAME + "] " + message);
    this.sendSocketNotification("AVL_ERROR", { message });
  }
});
