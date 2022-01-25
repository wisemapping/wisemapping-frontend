/* eslint-disable no-alert */
import $ from 'jquery';
import {
  Toolkit, Workspace, Line, Group, Elipse,
} from '../../src';

global.$ = $;

const basicTest = () => {
  const workspace = new Workspace();
  workspace.setSize('150px', '150px');
  workspace.setCoordSize(100, 100);

  const group = new Group();
  group.setSize(50, 50);
  group.setPosition(25, 50);
  group.setCoordSize(200, 200);
  group.setCoordOrigin(0, 0);
  workspace.append(group);

  const elipse = new Elipse();
  elipse.setSize(200, 200);
  elipse.setPosition(100, 100);
  group.append(elipse);

  let line = new Line();
  line.setFrom(0, 0);
  line.setTo(200, 200);
  line.setStroke('blue');
  group.append(line);

  line = new Line();
  line.setFrom(200, 0);
  line.setTo(0, 200);
  line.setStroke('blue');
  group.append(line);

  workspace.addItAsChildTo($('#groupBasicContainer'));

  let xDir = 1;
  let yDir = 1;
  const executer = function () {
    const y = group.getPosition().y + yDir;
    const x = group.getPosition().x + xDir;

    if (x < 0) {
      xDir = 1;
    } else if (x > 50) {
      xDir = -1;
    }

    if (y < 0) {
      yDir = 1;
    } else if (y > 50) {
      yDir = -1;
    }

    //  Logger.logMsg("Moving group x,y:"+ x + "," + y);
    group.setPosition(x, y);
  };
    // executer.periodical(100);
};
basicTest();

const eventTest = () => {
  const workspace = new Workspace();
  workspace.setSize('150px', '150px');
  workspace.setCoordSize(100, 100);

  const groupAttributes = {
    width: 50, height: 50, x: 25, y: 50, coordSize: '200 200', coordOrigin: '0 0',
  };
  const group = new Group(groupAttributes);
  workspace.append(group);

  const elipseLeft = new Elipse();
  elipseLeft.setSize(200, 200);
  elipseLeft.setPosition(200, 0);
  group.append(elipseLeft);

  const elipseRight = new Elipse();
  elipseRight.setSize(200, 200);
  elipseRight.setPosition(0, 0);
  group.append(elipseRight);

  const listener = function listener() {
    alert(`Click event on:${this.getType()}`);
  };

  group.addEvent('click', listener);
  elipseLeft.addEvent('click', listener);
  elipseRight.addEvent('click', listener);

  workspace.addItAsChildTo($('#groupEventsContainer'));
};
eventTest();

const eventTest2 = () => {
  const workspace = new Workspace();
  workspace.setSize('150px', '150px');
  workspace.setCoordSize(200, 200);

  const groupOuter = new Group();
  groupOuter.setSize(50, 50);
  groupOuter.setPosition(25, 25);
  groupOuter.setCoordSize(100, 100);
  groupOuter.setCoordOrigin(0, 0);
  workspace.append(groupOuter);

  const elipseOuter = new Elipse();
  elipseOuter.setSize(200, 200);
  elipseOuter.setPosition(100, 100);
  elipseOuter.setFill('red');
  groupOuter.append(elipseOuter);

  let line = new Line();
  line.setFrom(0, 0);
  line.setTo(200, 200);
  line.setStroke('red');
  groupOuter.append(line);

  line = new Line();
  line.setFrom(200, 0);
  line.setTo(0, 200);
  line.setStroke('red');
  groupOuter.append(line);

  const groupInner = new Group();
  groupInner.setSize(50, 50);
  groupInner.setPosition(25, 25);
  groupInner.setCoordSize(100, 100);
  groupInner.setCoordOrigin(0, 0);
  groupOuter.append(groupInner);

  const elipse = new Elipse();
  elipse.setSize(200, 200);
  elipse.setPosition(100, 100);
  groupInner.append(elipse);

  line = new Line();
  line.setFrom(0, 0);
  line.setTo(200, 200);
  line.setStroke('blue');
  groupInner.append(line);

  line = new Line();
  line.setFrom(200, 0);
  line.setTo(0, 200);
  line.setStroke('blue');
  groupInner.append(line);

  workspace.addItAsChildTo($('#groupNestedContainer'));
};
eventTest2();

const workspaceCoordSizeSample = () => {
  function groupSampleBuilder(width, height) {
    // Group with CoordSize(50,50);
    const workspace = new Workspace();
    workspace.setSize('100px', '100px');
    workspace.setCoordSize(100, 100);

    const elipseOuter = new Elipse();
    elipseOuter.setPosition(50, 50);
    elipseOuter.setSize(50, 50);
    workspace.append(elipseOuter);

    const group = new Group();
    group.setSize(50, 50);
    group.setCoordSize(width, height);
    group.setPosition(25, 25);
    workspace.append(group);

    const elipseInner = new Elipse();
    elipseInner.setPosition(50, 50);
    elipseInner.setSize(50, 50);
    elipseInner.setFill('red');
    group.append(elipseInner);

    return workspace;
  }

  const sample100x100 = groupSampleBuilder(100, 100);
  sample100x100.addItAsChildTo($('#coordsizeExample100x100'));

  const sample100x200 = groupSampleBuilder(100, 200);
  sample100x200.addItAsChildTo($('#coordsizeExample100x200'));

  const sample200x100 = groupSampleBuilder(200, 100);
  sample200x100.addItAsChildTo($('#coordsizeExample200x100'));
};
workspaceCoordSizeSample();

const workspaceCoordOriginSample = () => {
  function groupSampleBuilder(x, y) {
    const workspace = new Workspace();
    workspace.setSize('100px', '100px');
    workspace.setCoordSize(100, 100);

    const elipseOuter = new Elipse();
    elipseOuter.setPosition(50, 50);
    elipseOuter.setSize(50, 50);
    workspace.append(elipseOuter);

    const group = new Group();
    group.setSize(50, 50);
    group.setCoordSize(100, 100);
    group.setCoordOrigin(x, y);
    group.setPosition(25, 25);
    workspace.append(group);

    const elipseInner = new Elipse();
    elipseInner.setPosition(50, 50);
    elipseInner.setSize(50, 50);
    elipseInner.setFill('red');
    group.append(elipseInner);

    return workspace;
  }

  const sample0x0 = groupSampleBuilder(0, 0);
  sample0x0.addItAsChildTo($('#coordOriginExample0x0'));

  const sample100x200 = groupSampleBuilder(0, 50);
  sample100x200.addItAsChildTo($('#coordOriginExample0x50'));

  const sample200x100 = groupSampleBuilder(50, 0);
  sample200x100.addItAsChildTo($('#coordOriginExample50x0'));
};
workspaceCoordOriginSample();

const groupVisibilitySample = () => {
  const workspace = new Workspace();
  workspace.setSize('100px', '100px');
  workspace.setCoordSize(100, 100);

  const group = new Group();
  group.setSize(100, 100);
  group.setPosition(0, 0);
  group.setCoordSize(100, 100);
  group.addEvent('mouseover', () => {
    alert('Mouse Over Group');
  });
  workspace.append(group);

  const elipseOuter = new Elipse();
  elipseOuter.setPosition(50, 50);
  elipseOuter.setSize(50, 50);
  group.addEvent('mouseover', () => {
    alert('Mouse Over elipseOuter');
  });
  group.append(elipseOuter);

  const elipseInner = new Elipse();
  elipseInner.setPosition(50, 50);
  elipseInner.setSize(25, 25);
  elipseInner.setFill('red');
  group.append(elipseInner);

  let isVisible = true;
  const executer = function () {
    isVisible = !isVisible;
    group.setVisibility(isVisible);
  };
    // executer.periodical(100);
  workspace.addItAsChildTo($('#visibilityExample'));
};
groupVisibilitySample();

const groupVisibilitySample2 = () => {
  const workspace = new Workspace();
  workspace.setSize('100px', '100px');
  workspace.setCoordSize(100, 100);

  const group = new Group();
  group.setSize(100, 100);
  group.setPosition(0, 0);
  group.setCoordSize(100, 100);
  workspace.append(group);

  const elipseOuter = new Elipse();
  elipseOuter.setPosition(50, 50);
  elipseOuter.setSize(50, 50);
  group.append(elipseOuter);

  const elipseInner = new Elipse();
  elipseInner.setPosition(50, 50);
  elipseInner.setSize(25, 25);
  elipseInner.setFill('red');
  group.append(elipseInner);

  let width = 10;
  let height = 10;
  const executer = function () {
    width = (width + 10) % 100;
    height = (height + 10) % 100;
    group.setCoordSize(width, height);
  };
    // executer.periodical(100);
  workspace.addItAsChildTo($('#scaleStrokeExample'));
};
groupVisibilitySample2();
