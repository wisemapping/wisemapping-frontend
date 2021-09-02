'use strict';
module.exports = mindplot; //eslint-disable-line

function mindplot() {
    // Commands
    const { Commands } = require('./components/commands');

    // Layout
    const { Layout } = require('./components/layout');

    // Model
    const { Model } = require('./components/model');

    // Persistence
    const { Persistence } = require('./components/persistence');

    // Utils
    const { Utils } = require('./components/util');

    // Widgets
    const { Widgets } = require('./components/widget');

    // Components
    const { Components } = require('./components');

    return {
        commands: Commands,
        layouts: Layout,
        models: Model,
        persistence: Persistence,
        utils: Utils,
        widgets: Widgets,
        components: Components,
    };
}
