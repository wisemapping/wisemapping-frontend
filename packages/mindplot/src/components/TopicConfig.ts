/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

const CONNECTOR_WIDTH = 6;

const OUTER_SHAPE_ATTRIBUTES = {
  fillColor: 'rgb(252,235,192)',
  stroke: '1 solid rgb(241,163,39)',
  x: 0,
  y: 0,
};

const OUTER_SHAPE_ATTRIBUTES_FOCUS = { fillColor: 'rgb(244,184,45)', x: 0, y: 0 };

const INNER_RECT_ATTRIBUTES = { stroke: '2 solid' };

export default {
  CONNECTOR_WIDTH,
  OUTER_SHAPE_ATTRIBUTES,
  OUTER_SHAPE_ATTRIBUTES_FOCUS,
  INNER_RECT_ATTRIBUTES,
};
