'use strict';
module.exports = mindplot; //eslint-disable-line

function mindplot() {
    // Commands
    const { Commands } = require('./components/commands');

    // Layout
    const { Layout } = require('./components/layout');

    // Model
    const { Models } = require('./components/model');

    // Persistence
    const { Persistence } = require('./components/persistence');

    // Widgets
    const { Widgets } = require('./components/widget');

    // Commponents
    const { Components } = require('./components');

    return {
        Commands,
        Layout,
        Models,
        Persistence,
        Widgets,
        Components,
    };
}
