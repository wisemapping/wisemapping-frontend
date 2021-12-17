import { merge } from 'lodash';

class Options {
  setOptions(...args) {
    const options = merge({}, this.options, ...args);
    this.options = options;

    if (this.addEvent) {
      for (const option in options) {
        if (typeof (options[option]) !== 'function' || !(/^on[A-Z]/).test(option)) {
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
