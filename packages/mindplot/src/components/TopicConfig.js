/**
 * @constant
 * @type {Number}
 * @default
 */
const CONNECTOR_WIDTH = 6;
/**
 * @constant
 * @type {Object<String, Number>}
 * @default
 */
const OUTER_SHAPE_ATTRIBUTES = {
  fillColor: 'rgb(252,235,192)',
  stroke: '1 dot rgb(241,163,39)',
  x: 0,
  y: 0,
};
/**
 * @constant
 * @type {Object<String, Number>}
 * @default
 */
const OUTER_SHAPE_ATTRIBUTES_FOCUS = { fillColor: 'rgb(244,184,45)', x: 0, y: 0 };
/**
 * @constant
 * @type {Object<String>}
 * @default
 * */
const INNER_RECT_ATTRIBUTES = { stroke: '2 solid' };

export default {
  CONNECTOR_WIDTH,
  OUTER_SHAPE_ATTRIBUTES,
  OUTER_SHAPE_ATTRIBUTES_FOCUS,
  INNER_RECT_ATTRIBUTES,
};
