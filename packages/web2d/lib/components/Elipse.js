
const Element = require('./Element').default;
const Toolkit = require('./Toolkit').default;

const Elipse = new Class({
    Extends: Element,
    initialize: function(attributes) {
        var peer = Toolkit.createElipse();
        var defaultAttributes = {width:40, height:40, x:5, y:5,stroke:'1 solid black',fillColor:'blue'};
        for (var key in attributes) {
            defaultAttributes[key] = attributes[key];
        }
        this.parent(peer, defaultAttributes);
    },

    getType : function() {
        return "Elipse";
    },

    getSize : function() {
        return this._peer.getSize();
    }
});

export default Elipse;
