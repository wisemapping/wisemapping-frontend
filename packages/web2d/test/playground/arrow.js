import $ from '@libraries/jquery-2.1.0';
import {
  Toolkit, Workspace, Arrow, Point,
} from '../../src';

Toolkit.init();

const overflowWorkspace = new Workspace({ fillColor: 'green' });
overflowWorkspace.setSize('200px', '200px');
const arrow = new Arrow();
arrow.setFrom(50, 50);
arrow.setControlPoint(new Point(-50, 0));

overflowWorkspace.append(arrow);

const arrow2 = new Arrow();
arrow2.setFrom(100, 50);
arrow2.setControlPoint(new Point(50, 50));

overflowWorkspace.append(arrow2);

overflowWorkspace.addItAsChildTo($('#overflowExample').first());
