import '@libraries/mootools-core-1.4.5';
import $ from '@libraries/jquery-2.1.0';

// Import SVG
import elementPeer from '@svg/ElementPeer';
import workspacePeer from '@svg/WorkspacePeer';
import elipsePeer from '@svg/ElipsePeer';
import linePeer from '@svg/LinePeer';
import polyLinePeer from '@svg/PolyLinePeer';
import curvedLinePeer from '@svg/CurvedLinePeer';
import arrowPeer from '@svg/ArrowPeer';
import groupPeer from '@svg/GroupPeer';
import rectPeer from '@svg/RectPeer';
import textPeer from '@svg/TextPeer';
import fontPeer from '@svg/Font';
import tahomaFont from '@svg/TahomaFont';
import timesFont from '@svg/TimesFont';
import arialFont from '@svg/ArialFont';
import verdanaFont from '@svg/VerdanaFont';

// Utils
import eventUtils from '@utils/EventUtils';
import transformUtils from '@utils/TransformUtils';

// Import Components
import element from '@components/Element';
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

global.$ = $;

export default {
  // SVG
  ElementPeer: elementPeer,
  WorkspacePeer: workspacePeer,
  ElipsePeer: elipsePeer,
  LinePeer: linePeer,
  PolyLinePeer: polyLinePeer,
  CurvedLinePeer: curvedLinePeer,
  ArrowPeer: arrowPeer,
  GroupPeer: groupPeer,
  RectPeer: rectPeer,
  TextPeer: textPeer,
  FontPeer: fontPeer,
  TahomaFont: tahomaFont,
  TimesFont: timesFont,
  ArialFont: arialFont,
  VerdanaFont: verdanaFont,

  // Utils
  EventUtils: eventUtils,
  TransformUtils: transformUtils,

  // Components
  Arrow: arrow,
  CurvedLine: curvedLine,
  Element: element,
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
