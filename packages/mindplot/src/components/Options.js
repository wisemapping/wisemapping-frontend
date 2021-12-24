import merge from 'lodash/merge';

class Options {
  setOptions(...args) {
    const options = merge({}, this.options, ...args);
    this.options = options;

    if (this.addEvent) {
      const optionsKeys = Object.keys(options);
      for (let index = 0; index < optionsKeys.length; index++) {
        const option = optionsKeys[index];
        if (typeof (options[option]) === 'function' && (/^on[A-Z]/).test(option)) {
          this.addEvent(option, options[option]);
          delete options[option];
        }
      }
    }
    return this;
  }
}

export default Options;
