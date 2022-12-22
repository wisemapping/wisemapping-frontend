import $ from 'jquery';
import { Workspace, CurvedLine, Point, Elipse } from '../../src';

const drawLine = (type) => {
    const workspace = new Workspace();
    workspace.setSize('300px', '300px');
    workspace.setCoordSize(300, 300);
    workspace.setCoordOrigin(-150, -150);

    // Line 1 ...
    const line1 = new CurvedLine();
    line1.setStyle(type);
    line1.setFrom(0, 0);
    line1.setTo(100, 100);
    line1.setSrcControlPoint(new Point(100 / 2, 0));
    line1.setDestControlPoint(new Point(-100 / 2, 0));
    line1.setStroke(4, 'solid', 'blue', 1);
    workspace.append(line1);

    const line2 = new CurvedLine();
    line2.setStyle(type);
    line2.setFrom(0, 0);
    line2.setTo(-100, -100);
    line2.setSrcControlPoint(new Point(-100 / 2, 0));
    line2.setDestControlPoint(new Point(100 / 2, 0));
    workspace.append(line2);

    const line3 = new CurvedLine();
    line3.setStyle(type);
    line3.setFrom(0, 0);
    line3.setTo(100, -100);
    line3.setSrcControlPoint(new Point(100 / 2, 0));
    line3.setDestControlPoint(new Point(-100 / 2, 0));
    workspace.append(line3);

    const line4 = new CurvedLine();
    line4.setStyle(type);
    line4.setFrom(0, 0);
    line4.setTo(-100, 100);
    line4.setSrcControlPoint(new Point(-100 / 2, 0));
    line4.setDestControlPoint(new Point(100 / 2, 0));
    workspace.append(line4);

    // Add referene point ...
    const e1 = new Elipse();
    e1.setSize(30, 30);
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

    return workspace;
};

const w1 = drawLine(CurvedLine.SIMPLE_LINE);
w1.addItAsChildTo($('#curvedSimpleExample').first());

const w2 = drawLine(CurvedLine.NICE_LINE);
w2.addItAsChildTo($('#curvedNiceExample').first());
