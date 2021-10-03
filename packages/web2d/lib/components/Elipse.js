const Element = require('./Element').default;
const Toolkit = require('./Toolkit').default;

const Elipse = new Class({
  Extends: Element,
  initialize(attributes) {
    const peer = Toolkit.createElipse();
    const defaultAttributes = {
      width: 40, height: 40, x: 5, y: 5, stroke: '1 solid black', fillColor: 'blue',
    };
    for (const key in attributes) {
      defaultAttributes[key] = attributes[key];
    }
    this.parent(peer, defaultAttributes);
  },

  getType() {
    return 'Elipse';
  },

  getSize() {
    return this._peer.getSize();
  },
});

export default Elipse;
