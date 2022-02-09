import $ from 'jquery';
import {
  Workspace, CurvedLine, Point,
} from '../../src';

const workspace = new Workspace({ fillColor: 'green' });
workspace.setSize('400px', '400px');
const line1 = new CurvedLine();
line1.setStyle(CurvedLine.SIMPLE_LINE);
line1.setFrom(200, 200);
line1.setTo(100, 100);
line1.setSrcControlPoint(new Point(-100, 0));
line1.setDestControlPoint(new Point(100, 0));
workspace.append(line1);

const line2 = new CurvedLine();
line2.setStyle(CurvedLine.NICE_LINE);
line2.setFrom(0, 0);
line2.setTo(150, 90);
line2.setSrcControlPoint(new Point(100, 0));
line2.setDestControlPoint(new Point(-100, 0));
workspace.append(line2);

workspace.addItAsChildTo($('#overflowExample').first());
