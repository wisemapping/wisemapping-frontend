import $ from 'jquery';
import { Workspace, PolyLine, Elipse } from '../../src';

global.$ = $;
const drawLine = (type) => {
    const workspace = new Workspace();
    workspace.setSize('300px', '300px');
    workspace.setCoordSize(300, 300);
    workspace.setCoordOrigin(-150, -150);

    // Add referene point ...
    const e1 = new Elipse();
    e1.setSize(10, 10);
    e1.setPosition(0, 0);
    workspace.append(e1);

    const e2 = new Elipse();
    e2.setPosition(-100, -100);
    e2.setSize(10, 10);
    workspace.append(e2);

    const e3 = new Elipse();
    e3.setPosition(100, 100);
    e3.setSize(10, 10);
    workspace.append(e3);

    const e4 = new Elipse();
    e4.setPosition(-100, 100);
    e4.setSize(10, 10);
    workspace.append(e4);

    const e5 = new Elipse();
    e5.setPosition(100, -100);
    e5.setSize(10, 10);
    workspace.append(e5);

    // Line 1 ...
    const line1 = new PolyLine();
    line1.setFrom(0, 0);
    line1.setTo(100, 100);
    line1.setStyle(type);
    line1.setStroke('1');
    workspace.append(line1);

    const line2 = new PolyLine();
    line2.setFrom(0, 0);
    line2.setTo(-100, -100);
    line2.setStyle(type);
    line2.setStroke('1');
    workspace.append(line2);

    const line3 = new PolyLine();
    line3.setFrom(0, 0);
    line3.setTo(100, -100);
    line3.setStyle(type);
    line3.setStroke('1');
    workspace.append(line3);

    const line4 = new PolyLine();
    line4.setFrom(0, 0);
    line4.setTo(-100, 100);
    line4.setStyle(type);
    line2.setStroke('1');
    workspace.append(line4);

    return workspace;
};
const w1 = drawLine('Straight');
w1.addItAsChildTo($('#straightSample'));

const w2 = drawLine('MiddleStraight');
w2.addItAsChildTo($('#middleStraightSample'));

const w3 = drawLine('MiddleCurved');
w3.addItAsChildTo($('#middleCurvedSample'));

const w4 = drawLine('Curved');
w4.addItAsChildTo($('#curvedSample'));
