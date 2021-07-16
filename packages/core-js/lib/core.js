'use strict';

module.exports = coreJs; // eslint-disable-line

function coreJs() {
    global.core = require('./header'); // eslint-disable-line
    require('./Functions'); // eslint-disable-line
    require('./Utils'); // eslint-disable-line
    global.Options = require('@wisemapping/mindplot/lib/components/Options');
    global.BootstrapDialog = require('@wisemapping/mindplot/lib/components/libraries/bootstrap/BootstrapDialog');
    //require('@wisemapping/mindplot/lib/components/libraries/bootstrap/BootstrapDialog.Request');
    return global.core; // eslint-disable-line no-undef
}
