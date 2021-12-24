import $ from 'jquery';
import {
  Toolkit, Workspace, Line, Rect,
} from '../../src';

global.$ = $;

Toolkit.init();
const workspaceAttributes = {
  width: '700px', height: '100px', coordSize: '350 50', fillColor: '#ffffcc',
};
const strokeWidthWorkspace = new Workspace(workspaceAttributes);

const rect = new Rect();
rect.setSize(10, 10);
rect.setStroke(0);
rect.setPosition(250, 5);
strokeWidthWorkspace.append(rect);

for (let i = 0; i <= 10; i++) {
  const line = new Line();
  line.setFrom(5 + (i * 25), 5);
  line.setTo(5 + (i * 25), 45);
  line.setAttribute('strokeWidth', i + 1);
  strokeWidthWorkspace.append(line);
}
strokeWidthWorkspace.append(rect);

strokeWidthWorkspace.addItAsChildTo($('#strokeWidthSample'));

const strokeOpacityWorkspace = new Workspace(workspaceAttributes);
for (let i = 0; i < 10; i++) {
  const line = new Line();
  line.setFrom(15 + (i * 25), 5);
  line.setTo(3 + (i * 25), 45);
  line.setAttribute('strokeWidth', 2);
  line.setAttribute('strokeOpacity', 1 / (i + 1));
  line.setAttribute('strokeColor', 'red');
  strokeOpacityWorkspace.append(line);
}
strokeOpacityWorkspace.addItAsChildTo($('#strokeOpacitySample'));

const strokeStyleWorkspace = new Workspace(workspaceAttributes);
const styles = ['solid', 'dot', 'dash', 'dashdot', 'longdash'];
for (let i = 0; i < styles.length; i++) {
  const line = new Line();
  line.setFrom(25 + (i * 30), 5);
  line.setTo(13 + (i * 30), 45);
  line.setAttribute('strokeWidth', 2);
  line.setAttribute('strokeColor', 'red');
  line.setAttribute('strokeStyle', styles[i]);
  strokeStyleWorkspace.append(line);
}
strokeStyleWorkspace.addItAsChildTo($('#strokeStyleSample'));

const strokeArrowWorkspace = new Workspace(workspaceAttributes);
const styles2 = ['none ', 'block ', 'classic', 'diamond ', 'oval', 'open', 'chevron', 'doublechevron'];
for (let i = 0; i < styles.length; i++) {
  const line = new Line();
  line.setFrom(25 + (i * 30), 5);
  line.setTo(13 + (i * 30), 45);
  line.setAttribute('strokeWidth', 2);
  line.setAttribute('strokeColor', 'red');
  line.setArrowStyle(styles2[i]);
  strokeArrowWorkspace.append(line);
}
strokeArrowWorkspace.addItAsChildTo($('#strokeArrowSample'));
