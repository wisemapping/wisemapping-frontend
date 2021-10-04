'use strict';

function web2D() {
    global.$ = require('jquery');
    require('mootools');
    const coreJs = require('@wismapping/core-js'); //eslint-disable-line
    global.core = coreJs(); //eslint-disable-line

    const elementPeer = require('./components/peer/svg/ElementPeer').default; //eslint-disable-line
    const element = require('./components/Element').default; //eslint-disable-line
    const workspace = require('./components/Workspace').default; //eslint-disable-line
    const workspacePeer = require('./components/peer/svg/WorkspacePeer').default; //eslint-disable-line
    const toolkit = require('./components/Toolkit').default; //eslint-disable-line
    const elipse = require('./components/Elipse').default; //eslint-disable-line
    const elipsePeer = require('./components/peer/svg/ElipsePeer').default; //eslint-disable-line
    const linePeer = require('./components/peer/svg/LinePeer').default; //eslint-disable-line
    const line = require('./components/Line').default; //eslint-disable-line
    const polyLine = require('./components/PolyLine').default; //eslint-disable-line
    const curvedLine = require('./components/CurvedLine').default; //eslint-disable-line
    const arrow = require('./components/Arrow').default; //eslint-disable-line
    const polyLinePeer = require('./components/peer/svg/PolyLinePeer').default; //eslint-disable-line
    const curvedLinePeer = require('./components/peer/svg/CurvedLinePeer').default; //eslint-disable-line
    const arrowPeer = require('./components/peer/svg/ArrowPeer').default; //eslint-disable-line
    const groupPeer = require('./components/peer/svg/GroupPeer').default; //eslint-disable-line
    const group = require('./components/Group').default; //eslint-disable-line
    const rect = require('./components/Rect').default; //eslint-disable-line
    const rectPeer = require('./components/peer/svg/RectPeer').default; //eslint-disable-line
    const text = require('./components/Text').default; //eslint-disable-line
    const textPeer = require('./components/peer/svg/TextPeer').default; //eslint-disable-line
    const transformUtils = require('./components/peer/utils/TransformUtils').default; //eslint-disable-line
    const eventUtils = require('./components/peer/utils/EventUtils').default; //eslint-disable-line
    const font = require('./components/Font').default; //eslint-disable-line
    const fontPeer = require('./components/peer/svg/Font').default; //eslint-disable-line
    const tahomaFont = require('./components/peer/svg/TahomaFont').default; //eslint-disable-line
    const timesFont = require('./components/peer/svg/TimesFont').default; //eslint-disable-line
    const arialFont = require('./components/peer/svg/ArialFont').default; //eslint-disable-line
    const verdanaFont = require('./components/peer/svg/VerdanaFont').default; //eslint-disable-line
    const point = require('./components/Point').default; //eslint-disable-line

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

    return web2d; //eslint-disable-line
}

module.exports = web2D; //eslint-disable-line
