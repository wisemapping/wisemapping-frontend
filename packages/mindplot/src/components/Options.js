class Options {

  setOptions(...args) {
    this.options = { ...this.options, ...args };
    const { options } = this;

    if (this.addEvent) {
      for (const option in options) {
        if (typeof (options[option]) != 'function' || !(/^on[A-Z]/).test(option) ){ 
          continue;
        }
        this.addEvent(option, options[option]);
        delete options[option];
      }
    }
    return this;
  }

}

export default Options;
