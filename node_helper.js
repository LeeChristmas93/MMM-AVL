/* Node helper for MMM-AVL
 * - fetches .ics from configured URL
 * - parses events with node-ical
 * - schedules periodic updates
 */

const NodeHelper = require("node_helper");
const axios = require("axios");
const ical = require("node-ical");

module.exports = NodeHelper.create({
  start: function () {
    this.config = null;
    this.timer = null;
    this.lastValidIcs = null;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "AVL_CONFIG") {
      this.config = payload;
    } else if (notification === "AVLFETCH") {
      this._setupAndFetch();
    }
  },

  _setupAndFetch: function () {
    if (!this.config || !this.config.url) {
      this.sendSocketNotification("AVL_ERROR", { message: "Keine URL konfiguriert" });
      return;
    }

    // initial fetch
    this._fetchCalendar();

    // schedule repeating fetch
    if (this.timer) clearInterval(this.timer);
    var interval = this.config.updateInterval || 1000 * 60 * 60 * 12;
    this.timer = setInterval(() => this._fetchCalendar(), interval);
  },

  _parseIcs: function (data) {
    try {
      const parsed = ical.parseICS(data);
      const events = [];
      const now = new Date();
      const maxDays = this.config.maximumNumberOfDays || 365;
      const maxEntries = this.config.maximumEntries || 20;

      for (let k in parsed) {
        const e = parsed[k];
        if (e && e.type === "VEVENT") {
          const start = e.start;
          if (!start) continue;
          const diffDays = (start - now) / (1000 * 60 * 60 * 24);
          if (diffDays >= -1 && diffDays <= maxDays) {
            // normalize summary to string (extract first value only)
            let summaryText = "";
            if (typeof e.summary === "string") {
              summaryText = e.summary.trim();
            } else if (e.summary && typeof e.summary === "object") {
              // handle ical.js parsed format: summary.val or summary (for Array)
              if (e.summary.val) {
                summaryText = (Array.isArray(e.summary.val) ? e.summary.val[0] : e.summary.val).toString().trim();
              } else if (Array.isArray(e.summary)) {
                summaryText = (e.summary[0] || "").toString().trim();
              } else if (e.summary.toString) {
                summaryText = e.summary.toString().trim();
              }
            }

            // detect waste type by keywords (German)
            const s = summaryText.toLowerCase();
            let wasteType = null;
            if (s.includes("rest") || s.includes("restm")) wasteType = "Restmüll";
            else if (s.includes("bio") || s.includes("biom")) wasteType = "Biomüll";
            else if (s.includes("papier") || s.includes("papi")) wasteType = "Papier";
            else if (s.includes("glas")) wasteType = "Glas";
            else if (s.includes("plast") || s.includes("gelb") || s.includes("verpack")) wasteType = "Plastik";
            else wasteType = "Sonstiges";

            events.push({
              summary: summaryText || "",
              date: start.toLocaleDateString(),
              type: wasteType,
              raw: e
            });
          }
        }
      }
      events.sort((a, b) => new Date(a.raw.start) - new Date(b.raw.start));
      return events.slice(0, maxEntries);
    } catch (e) {
      throw e;
    }
  },

  _fetchCalendar: async function () {
    const url = this.config.url;
    try {
      const res = await axios.get(url, { responseType: "text", timeout: 20000 });
      const ics = res.data;
      const events = this._parseIcs(ics);
      this.lastValidIcs = ics;
      this.sendSocketNotification("AVL_EVENTS", { events: events });
    } catch (err) {
      // error: try to fallback to last valid ICS
      this.sendSocketNotification("AVL_ERROR", { message: err.message });
      if (this.lastValidIcs) {
        try {
          const events = this._parseIcs(this.lastValidIcs);
          this.sendSocketNotification("AVL_EVENTS", { events: events });
        } catch (e) {
          // ignore
        }
      }
    }
  }

});
