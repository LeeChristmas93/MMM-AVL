/* MagicMirror2 Module: MMM-AVL
 * Displays upcoming AVL waste collection dates from an iCalendar feed.
 */

Module.register("MMM-AVL", {
  defaults: {
    url: "",
    updateInterval: 12 * 60 * 60 * 1000,
    maximumEntries: 6,
    maximumNumberOfDays: 365,
    fetchOnStart: true,
    showSymbols: true
  },

  start() {
    Log.info(this.name + " started.");

    this.events = [];
    this.loaded = false;
    this.error = null;

    this.sendSocketNotification("AVL_CONFIG", this.config);

    if (this.config.fetchOnStart) {
      this.sendSocketNotification("AVL_FETCH");
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "AVL_EVENTS") {
      this.events = Array.isArray(payload.events) ? payload.events : [];
      this.loaded = true;
      this.error = null;
      this.updateDom();
      return;
    }

    if (notification === "AVL_ERROR") {
      this.loaded = true;
      this.error = payload && payload.message ? payload.message : "Unbekannter Fehler";
      Log.error(this.name + ": " + this.error);
      this.updateDom();
    }
  },

  getStyles() {
    return ["css/mmm-avl.css"];
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "small bright mmm-avl";

    if (!this.loaded) {
      wrapper.appendChild(this.createMessage("Lade Abfuhrtermine..."));
      return wrapper;
    }

    if (this.error && this.events.length === 0) {
      wrapper.appendChild(this.createMessage("Abfuhrtermine nicht verfuegbar."));
      return wrapper;
    }

    if (this.events.length === 0) {
      wrapper.appendChild(this.createMessage("Keine Abfuhrtermine gefunden."));
      return wrapper;
    }

    const list = document.createElement("div");
    list.className = "mmm-avl-list";

    this.events.slice(0, this.config.maximumEntries).forEach((event) => {
      list.appendChild(this.createEventItem(event));
    });

    wrapper.appendChild(list);
    return wrapper;
  },

  createMessage(text) {
    const message = document.createElement("div");
    message.className = "dimmed mmm-avl-message";
    message.textContent = text;
    return message;
  },

  createEventItem(event) {
    const item = document.createElement("div");
    item.className = this.config.showSymbols ? "mmm-avl-item" : "mmm-avl-item mmm-avl-item--no-symbol";

    if (this.config.showSymbols) {
      const icon = document.createElement("span");
      icon.className = "mmm-avl-icon fa " + this.getIconClass(event.type);
      icon.setAttribute("aria-hidden", "true");
      item.appendChild(icon);
    }

    const date = document.createElement("span");
    date.className = "mmm-avl-date";
    date.textContent = event.date || "";

    const type = document.createElement("span");
    type.className = "mmm-avl-type";
    type.textContent = event.type || "Sonstiges";

    item.appendChild(date);
    item.appendChild(type);

    return item;
  },

  getIconClass(type) {
    const icons = {
      "Restmüll": "fa-trash",
      "Biomüll": "fa-leaf",
      "Papier": "fa-newspaper-o",
      "Glas": "fa-glass",
      "Gelber Sack": "fa-recycle",
      "Sonstiges": "fa-calendar"
    };

    return icons[type] || icons.Sonstiges;
  }
});
