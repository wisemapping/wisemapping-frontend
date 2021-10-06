/* eslint-disable global-require */
function web2D() {
  global.$ = require('jquery');
  require('mootools');
  const coreJs = require('@wismapping/core-js');
  global.core = coreJs();

  const elementPeer = require('./components/peer/svg/ElementPeer').default;
  const element = require('./components/Element').default;
  const workspace = require('./components/Workspace').default;
  const workspacePeer = require('./components/peer/svg/WorkspacePeer').default;
  const toolkit = require('./components/Toolkit').default;
  const elipse = require('./components/Elipse').default;
  const elipsePeer = require('./components/peer/svg/ElipsePeer').default;
  const linePeer = require('./components/peer/svg/LinePeer').default;
  const line = require('./components/Line').default;
  const polyLine = require('./components/PolyLine').default;
  const curvedLine = require('./components/CurvedLine').default;
  const arrow = require('./components/Arrow').default;
  const polyLinePeer = require('./components/peer/svg/PolyLinePeer').default;
  const curvedLinePeer = require('./components/peer/svg/CurvedLinePeer').default;
  const arrowPeer = require('./components/peer/svg/ArrowPeer').default;
  const groupPeer = require('./components/peer/svg/GroupPeer').default;
  const group = require('./components/Group').default;
  const rect = require('./components/Rect').default;
  const rectPeer = require('./components/peer/svg/RectPeer').default;
  const text = require('./components/Text').default;
  const textPeer = require('./components/peer/svg/TextPeer').default;
  const transformUtils = require('./components/peer/utils/TransformUtils').default;
  const eventUtils = require('./components/peer/utils/EventUtils').default;
  const font = require('./components/Font').default;
  const fontPeer = require('./components/peer/svg/Font').default;
  const tahomaFont = require('./components/peer/svg/TahomaFont').default;
  const timesFont = require('./components/peer/svg/TimesFont').default;
  const arialFont = require('./components/peer/svg/ArialFont').default;
  const verdanaFont = require('./components/peer/svg/VerdanaFont').default;
  const point = require('./components/Point').default;

  const web2d = {
    ElementPeer: elementPeer,
    Element: element,
    Workspace: workspace,
    WorkspacePeer: workspacePeer,
    Toolkit: toolkit,
    Elipse: elipse,
    ElipsePeer: elipsePeer,
    LinePeer: linePeer,
    Line: line,
    PolyLine: polyLine,
    CurvedLine: curvedLine,
    Arrow: arrow,
    PolyLinePeer: polyLinePeer,
    CurvedLinePeer: curvedLinePeer,
    ArrowPeer: arrowPeer,
    GroupPeer: groupPeer,
    Group: group,
    Rect: rect,
    RectPeer: rectPeer,
    Text: text,
    TextPeer: textPeer,
    TransformUtils: transformUtils,
    EventUtils: eventUtils,
    Font: font,
    FontPeer: fontPeer,
    TahomaFont: tahomaFont,
    TimesFont: timesFont,
    ArialFont: arialFont,
    VerdanaFont: verdanaFont,
    Point: point,
  };

  return web2d;
}

module.exports = web2D;
