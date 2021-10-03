'use strict';
module.exports = mindplot; //eslint-disable-line

function mindplot() {
    // Jquery for mindplot and bootstrap
    global.$ = require('jquery');
    global.jQuery = require('jquery');

    // Mootools for the classes of Mindplot
    require('mootools');

    // Underscore handling common tasks
    global._ = require('underscore');

    // Core-js packages of Wisemapping
    global.core = require('@wismapping/core-js');

    define(['raphael'], (Raphael) => {
        global.Raphael = Raphael;
    });
    require('../test/playground/lib/raphael-plugins');

    // Bootsrap for styles
    require('./components/libraries/bootstrap/js/bootstrap.min');

    /* * * * * * * *
     *   MINDPLOT  *
     * * * * * * * */

    // Commands
    const { Commands } = require('./components/commands');

    // Layout
    const { Layout } = require('./components/layout');

    // Model

    const { Model } = require('./components/model');

    // Persistence
    const { Persistence } = require('./components/persistence');

    // Widgets
    const { Widgets } = require('./components/widget');

    // Components
    const { Components } = require('./components');

    return {
        commands: Commands,
        layout: Layout,
        models: Model,
        persistence: Persistence,
        widget: Widgets,
        component: Components,
    };
}
