/* Node helper for MMM-AVL
 * - Fetches .ics from configured URL
 * - Parses events with node-ical
 * - Schedules periodic updates
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
      this.sendSocketNotification("AVL_ERROR", { message: "No URL configured" });
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
            events.push({
              summary: e.summary || "",
              date: start.toLocaleDateString(),
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
