class Options {

  setOptions() {
    const options = this.options = Object.merge.apply(null, [{}, this.options].append(arguments));
    if (this.addEvent) {
      for (const option in options) {
        if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
        this.addEvent(option, options[option]);
        delete options[option];
      }
    }
    return this;
  }

}

export default Options;
