const Events = new Class({
  $events: {},

  _removeOn(string) {
    return string.replace(/^on([A-Z])/, (full, first) => first.toLowerCase());
  },

  addEvent(type, fn, internal) {
    type = this._removeOn(type);

    this.$events[type] = (this.$events[type] || []).include(fn);
    if (internal) fn.internal = true;
    return this;
  },

  fireEvent(type, args, delay) {
    type = this._removeOn(type);
    const events = this.$events[type];
    if (!events) return this;
    args = Array.isArray(args) ? args : [args];
    _.each(
      events,
      function (fn) {
        if (delay) fn.delay(delay, this, args);
        else fn.apply(this, args);
      },
      this,
    );
    return this;
  },

  removeEvent(type, fn) {
    type = this._removeOn(type);
    const events = this.$events[type];
    if (events && !fn.internal) {
      const index = events.indexOf(fn);
      if (index != -1) events.splice(index, 1);
    }
    return this;
  },
});

export default Events;
