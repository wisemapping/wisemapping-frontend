import '@libraries/mootools-core-1.4.5';
import $ from '@libraries/jquery-2.1.0';
import _ from '@libraries/underscore-min';

import coreJs from '@wisemapping/core-js';

import commands from '@commands';
import layout from '@layout';
import models from '@model';
import persistence from '@persistence';
import widget from '@widget';
import component from '@components';

global.$ = $;
global.JQuery = $;
global._ = _;
global.core = coreJs();

export default {
  commands,
  layout,
  models,
  persistence,
  widget,
  ...component,
};
