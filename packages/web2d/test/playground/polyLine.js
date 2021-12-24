import $ from 'jquery';
import {
  Toolkit, Workspace, PolyLine,
} from '../../src';

global.$ = $;
Toolkit.init();

let overflowWorkspace = new Workspace({ fillColor: 'green' });
overflowWorkspace.setSize('100px', '100px');

const line = new PolyLine();
line.setTo(165, 165);
line.setFrom(95, 95);
line.setStyle('Straight');
line.setStroke('10');
overflowWorkspace.append(line);

overflowWorkspace.addItAsChildTo($('#overflowExample'));

overflowWorkspace = new Workspace();
overflowWorkspace.setSize('100px', '100px');
let line1 = new PolyLine();
line1.setFrom(95, 95);
line1.setTo(165, 165);
line1.setStyle('Curved');
overflowWorkspace.append(line1);

line1 = new PolyLine();
line1.setFrom(95, 95);
line1.setTo(165, 135);
line1.setStyle('Curved');
overflowWorkspace.append(line1);

line1 = new PolyLine();
line1.setFrom(95, 90);
line1.setTo(160, 20);
line1.setStyle('Straight');
overflowWorkspace.append(line1);

line1 = new PolyLine();
line1.setFrom(95, 90);
line1.setTo(160, 50);
line1.setStyle('Straight');
overflowWorkspace.append(line1);

line1 = new PolyLine();
line1.setFrom(90, 90);
line1.setTo(20, 20);
overflowWorkspace.append(line1);

line1 = new PolyLine();
line1.setFrom(90, 90);
line1.setTo(20, 50);
overflowWorkspace.append(line1);

line1 = new PolyLine();
line1.setFrom(90, 95);
line1.setTo(20, 165);
overflowWorkspace.append(line1);

line1 = new PolyLine();
line1.setFrom(90, 95);
line1.setTo(20, 135);
overflowWorkspace.append(line1);

overflowWorkspace.addItAsChildTo($('#multipleLineExample'));
