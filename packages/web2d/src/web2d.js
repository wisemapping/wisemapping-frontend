import '@libraries/mootools-core-1.4.5';

// Utils
import eventUtils from '@utils/EventUtils';
import transformUtils from '@utils/TransformUtils';

// Import Components
import workspace from '@components/Workspace';
import toolkit from '@components/Toolkit';
import elipse from '@components/Elipse';
import line from '@components/Line';
import polyLine from '@components/PolyLine';
import curvedLine from '@components/CurvedLine';
import arrow from '@components/Arrow';
import group from '@components/Group';
import rect from '@components/Rect';
import text from '@components/Text';
import font from '@components/Font';
import point from '@components/Point';
import image from '@components/Image';

export default {
  // Utils
  EventUtils: eventUtils,
  TransformUtils: transformUtils,

  // Components
  Arrow: arrow,
  CurvedLine: curvedLine,
  Elipse: elipse,
  Font: font,
  Group: group,
  Image: image,
  Line: line,
  Point: point,
  PolyLine: polyLine,
  Rect: rect,
  Text: text,
  Toolkit: toolkit,
  Workspace: workspace,
};
