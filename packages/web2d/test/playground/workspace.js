import $ from 'jquery';
import {
  Toolkit, Workspace, Elipse,
} from '../../src';
import Grid from './Grid';

global.$ = $;

Toolkit.init();

const overflowWorkspace = new Workspace();
overflowWorkspace.setSize('100px', '100px');
const elipse1 = new Elipse();
elipse1.setSize(200, 200);
elipse1.setPosition(0, 0);
overflowWorkspace.append(elipse1);
overflowWorkspace.addItAsChildTo($('#overflowExample'));

const workspacePosition = () => {
  const elipseAttr = {
    width: 100, height: 100, x: 100, y: 100,
  };

  const divElem = $('#positionExample');
  const workPosition = new Workspace();
  workPosition.setSize('100px', '100px');
  const elipse = new Elipse(elipseAttr);
  workPosition.append(elipse);
  workPosition.addItAsChildTo(divElem);

  let x = 100;
  const executer = () => {
    x = (x + 10) % 100;
    divElem.css('left', `${x}px`);
  };
  //   executer.periodical(100);
};
workspacePosition();

// Draw a reference grid.

// Enable when JS is loading ...
const container = document.getElementById('sizeExampleContainer');
const grid = new Grid(container, 35, 12);
grid.setPosition('0px', '0px');
grid.render();

// Define a workspace using pixels and inchs.
const workspacePixel = new Workspace();
workspacePixel.setSize('100px', '100px');
let elipse = new Elipse();
elipse.setSize(100, 100);
elipse.setPosition(100, 100);

workspacePixel.append(elipse);
workspacePixel.addItAsChildTo($('#sizeExamplePixels'));

const workspaceInchs = new Workspace();
workspaceInchs.setSize('1in', '1in');
elipse = new Elipse();
elipse.setSize(100, 100);
elipse.setPosition(100, 100);

workspaceInchs.append(elipse);
workspaceInchs.addItAsChildTo($('#sizeExampleInch'));

const workspaceCoordSizeSample = () => {
  // Workspace with CoordSize(100,100);
  const coordSizeSampleBuilder = (width, height) => {
    const workspace = new Workspace();
    workspace.setSize('100px', '100px');
    workspace.setCoordSize(width, height);

    elipse = new Elipse();
    elipse.setPosition(50, 50);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(0, 0);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(0, 100);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(100, 0);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(100, 100);
    workspace.append(elipse);
    return workspace;
  };

  const workspace100x100 = coordSizeSampleBuilder(100, 100);
  workspace100x100.addItAsChildTo($('#coordsizeExample100x100'));

  const workspace100x200 = coordSizeSampleBuilder(100, 200);
  workspace100x200.addItAsChildTo($('#coordsizeExample100x200'));

  const workspace200x100 = coordSizeSampleBuilder(200, 100);
  workspace200x100.addItAsChildTo($('#coordsizeExample200x100'));

  const dynamicWorkspace = coordSizeSampleBuilder(100, 100);
  dynamicWorkspace.addItAsChildTo($('#coordsizeExampleDynamic'));

  let size = 100;
  const executer = () => {
    size = (size + 1) % 100;
    if (size < 30) {
      size = 30;
    }

    dynamicWorkspace.setCoordSize(size, size);
  };
  // executer.periodical(100);
  dynamicWorkspace.setCoordSize(size, size);
};

workspaceCoordSizeSample();

const workspaceCoordOriginSample = () => {
  const coordOriginSampleBuilder = (x, y) => {
    // Workspace with CoordOrigin(100,100);
    const workspace = new Workspace();
    workspace.setSize('100px', '100px');
    workspace.setCoordSize(100, 100);
    workspace.setCoordOrigin(x, y);

    elipse = new Elipse();
    elipse.setPosition(0, 0);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(0, 100);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(100, 0);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(100, 100);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(50, 50);
    workspace.append(elipse);

    elipse = new Elipse();
    elipse.setPosition(100, 100);
    workspace.append(elipse);

    return workspace;
  };

  const workspace0x0 = coordOriginSampleBuilder(0, 0);
  workspace0x0.addItAsChildTo($('#coordorigin0x0'));

  const workspace0x50 = coordOriginSampleBuilder(0, 50);
  workspace0x50.addItAsChildTo($('#coordorigin0x50'));

  const workspace50x0 = coordOriginSampleBuilder(50, 0);
  workspace50x0.addItAsChildTo($('#coordorigin50x0'));

  // Workspace animation changing the coordsize from (30,30) to (100,100)
  const dynamicWorkspace = coordOriginSampleBuilder(100, 100);
  dynamicWorkspace.addItAsChildTo($('#coordoriginExampleDynamic'));

  let x = 50;
  let y = 50;
  const executer = () => {
    x = (x + 1) % 50;
    y = (y + 1) % 50;

    dynamicWorkspace.setCoordOrigin(x, y);
  };
  //   executer.periodical(100);
};
workspaceCoordOriginSample();
