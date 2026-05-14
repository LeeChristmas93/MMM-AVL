Module.register("MMM-AVL", {

  defaults: {
    url: "",
    updateInterval: 1000 * 60 * 60 * 12, // 12 hours
    maximumEntries: 6,
    maximumNumberOfDays: 365,
    fetchOnStart: true,
    showSymbols: true
  },

  start: function () {
    this.events = [];
    this.loaded = false;
    this.sendSocketNotification("AVL_CONFIG", this.config);
    if (this.config.fetchOnStart) {
      this.sendSocketNotification("AVLFETCH", this.config);
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "AVL_EVENTS") {
      this.events = payload.events || [];
      this.loaded = true;
      this.updateDom();
    } else if (notification === "AVL_ERROR") {
      this.loaded = true;
      this.updateDom();
      console.error(this.name + ": AVL_ERROR", payload);
    }
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.className = "mmm-avl";

    if (!this.loaded) {
      wrapper.innerHTML = "Lade Abfuhrtermine...";
      return wrapper;
    }

    if (!this.events || this.events.length === 0) {
      wrapper.innerHTML = "Keine Abfuhrtermine gefunden.";
      return wrapper;
    }

    var list = document.createElement("ul");
    list.className = "mmm-avl-list";

    var max = this.config.maximumEntries || this.events.length;
    for (var i = 0; i < Math.min(max, this.events.length); i++) {
      var ev = this.events[i];
      var li = document.createElement("li");
      li.className = "mmm-avl-item";

      var date = document.createElement("span");
      date.className = "mmm-avl-date";
      date.textContent = ev.date;

      var icon = document.createElement("span");
      icon.className = "mmm-avl-icon fa fa-trash";
      // choose icon based on type
      var type = ev.type || "Sonstiges";
      if (type === "Biomüll") icon.className = "mmm-avl-icon fa fa-leaf";
      else if (type === "Papier") icon.className = "mmm-avl-icon fa fa-newspaper-o";
      else if (type === "Glas") icon.className = "mmm-avl-icon fa fa-wine-glass";
      else if (type === "Plastik") icon.className = "mmm-avl-icon fa fa-recycle";
      else icon.className = "mmm-avl-icon fa fa-trash";

      var title = document.createElement("span");
      title.className = "mmm-avl-title";
      title.textContent = ev.summary;

      var typeSpan = document.createElement("span");
      typeSpan.className = "mmm-avl-type";
      typeSpan.textContent = type;

      li.appendChild(icon);
      li.appendChild(date);
      li.appendChild(typeSpan);
      li.appendChild(title);
      list.appendChild(li);
    }

    wrapper.appendChild(list);
    return wrapper;
  }

});
