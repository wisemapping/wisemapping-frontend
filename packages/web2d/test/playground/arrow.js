import $ from 'jquery';
import { Workspace, Arrow, Point } from '../../src';

const workspace = new Workspace({ fillColor: 'green' });
workspace.setSize('200px', '200px');
const arrow = new Arrow();
arrow.setFrom(50, 50);
arrow.setControlPoint(new Point(-50, 0));

workspace.append(arrow);

const arrow2 = new Arrow();
arrow2.setFrom(100, 50);
arrow2.setControlPoint(new Point(50, 50));

workspace.append(arrow2);

workspace.addItAsChildTo($('#overflowExample').first());
