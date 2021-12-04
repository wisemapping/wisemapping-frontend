import $ from '@libraries/jquery-2.1.0';
import {
  Toolkit, Workspace, Rect,
} from '../../src';

global.$ = $;

Toolkit.init();

const strokeStyleTest = () => {
  function builder(parent, scale, strokeWidth) {
    const rectSize = scale * 80;
    const yPosition = 10 * scale;

    let xPosition = 10 * scale;
    let rect = new Rect();
    rect.setSize(rectSize, rectSize);
    rect.setPosition(xPosition, yPosition);
    rect.setFill('yellow');
    rect.setStroke(1, 'solid', 'black');
    parent.append(rect);

    xPosition += 90 * scale;
    rect = new Rect();
    rect.setSize(rectSize, rectSize);
    rect.setPosition(xPosition, yPosition);
    rect.setFill('yellow');
    rect.setStroke(strokeWidth, 'dot', 'black');
    parent.append(rect);

    xPosition += 90 * scale;
    rect = new Rect();
    rect.setSize(rectSize, rectSize);
    rect.setPosition(xPosition, yPosition);
    rect.setFill('yellow');
    rect.setStroke(strokeWidth, 'dash', 'black');
    parent.append(rect);

    xPosition += 90 * scale;
    rect = new Rect();
    rect.setSize(rectSize, rectSize);
    rect.setPosition(xPosition, yPosition);
    rect.setFill('yellow');
    rect.setStroke(strokeWidth, 'longdash', 'black');
    parent.append(rect);

    xPosition += 90 * scale;
    rect = new Rect();
    rect.setSize(rectSize, rectSize);
    rect.setPosition(xPosition, yPosition);
    rect.setFill('yellow');
    rect.setStroke(strokeWidth, 'dashdot', 'black');
    parent.append(rect);
  }

  // Workspace with default scale ...
  let workspace = new Workspace();
  workspace.setSize('500px', '100px');
  workspace.setCoordSize(500, 100);
  workspace.setCoordOrigin(0, 0);
  builder(workspace, 1, 1);
  workspace.addItAsChildTo($('#strokeStyle'));

  // Workspace with modified scale ...
  workspace = new Workspace();
  workspace.setSize('500px', '100px');
  workspace.setCoordSize(5000, 1000);
  workspace.setCoordOrigin(0, 0);
  builder(workspace, 10, 1);
  workspace.addItAsChildTo($('#strokeStyleGroup'));

  // Workspace with default scale ...
  workspace = new Workspace();
  workspace.setSize('500px', '100px');
  workspace.setCoordSize(500, 100);
  workspace.setCoordOrigin(0, 0);
  builder(workspace, 1, 5);
  workspace.addItAsChildTo($('#strokeStyleWidth'));
};
strokeStyleTest();

const strokeOpacityTest = () => {
  const workspace = new Workspace();
  workspace.setSize('500px', '100px');
  workspace.setCoordSize(500, 100);
  workspace.setCoordOrigin(0, 0);

  let rect = new Rect(0, {
    x: 5,
    y: 5,
    width: 390,
    height: 90,
    fillColor: 'green',
    strokeColor: 'black',
    strokeStyle: 'solid',
    strokeWidth: 1,
  });
  workspace.append(rect);

  const rectAttributes = {
    width: 60, height: 60, fillColor: 'yellow', strokeColor: 'black', strokeStyle: 'solid', strokeWidth: 10,
  };
  rect = new Rect(0, rectAttributes);
  rect.setPosition(20, 20);
  rect.setAttribute('strokeOpacity', 1);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(120, 20);
  rect.setAttribute('strokeOpacity', 0.5);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(220, 20);
  rect.setAttribute('strokeOpacity', 0.3);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(320, 20);
  rect.setAttribute('strokeOpacity', 0);
  workspace.append(rect);

  workspace.addItAsChildTo($('#strokeOpacity'));
};
strokeOpacityTest();

const fillOpacityTest = () => {
  const workspace = new Workspace();
  workspace.setSize('500px', '100px');
  workspace.setCoordSize(500, 100);
  workspace.setCoordOrigin(0, 0);

  let rect = new Rect(0, {
    x: 5,
    y: 5,
    width: 390,
    height: 90,
    fillColor: 'green',
    strokeColor: 'black',
    strokeStyle: 'solid',
    strokeWidth: 4,
  });
  workspace.append(rect);

  const rectAttributes = {
    width: 60, height: 60, fillColor: 'yellow', strokeColor: 'black', strokeStyle: 'solid', strokeWidth: 10,
  };
  rect = new Rect(0, rectAttributes);
  rect.setPosition(20, 20);
  rect.setAttribute('fillOpacity', 1);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(120, 20);
  rect.setAttribute('fillOpacity', 0.5);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(220, 20);
  rect.setAttribute('fillOpacity', 0.3);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(320, 20);
  rect.setAttribute('fillOpacity', 0);
  workspace.append(rect);

  workspace.addItAsChildTo($('#fillOpacity'));
};
fillOpacityTest();

const opacityTest = () => {
  const workspace = new Workspace();
  workspace.setSize('500px', '100px');
  workspace.setCoordSize(500, 100);
  workspace.setCoordOrigin(0, 0);

  let rect = new Rect(0, {
    x: 5,
    y: 5,
    width: 390,
    height: 90,
    fillColor: 'green',
    strokeColor: 'black',
    strokeStyle: 'solid',
    strokeWidth: 4,
  });
  workspace.append(rect);

  const rectAttributes = {
    width: 60, height: 60, fillColor: 'yellow', strokeColor: 'black', strokeStyle: 'solid', strokeWidth: 10,
  };
  rect = new Rect(0, rectAttributes);
  rect.setPosition(20, 20);
  rect.setOpacity(0.8);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(120, 20);
  rect.setOpacity(0.5);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(220, 20);
  rect.setOpacity(0.3);
  workspace.append(rect);

  rect = new Rect(0, rectAttributes);
  rect.setPosition(320, 20);
  rect.setOpacity(0);
  workspace.append(rect);

  workspace.addItAsChildTo($('#opacity'));
};
opacityTest();

const visibilityTest = () => {
  const workspace = new Workspace({ fillColor: 'yellow', strokeWidth: '2px' });
  workspace.setSize('500px', '100px');
  workspace.setCoordSize(500, 100);
  workspace.setCoordOrigin(0, 0);

  const rectAttributes = {
    width: 60, height: 60, fillColor: 'green', strokeColor: 'black', strokeStyle: 'solid', strokeWidth: 10,
  };
  const rect = new Rect(0, rectAttributes);
  rect.setPosition(120, 20);
  workspace.append(rect);
  rect.addEvent('mouseover', () => {
    alert('Mouse Over');
  });

  let isVisible = true;
  const executer = function () {
    isVisible = !isVisible;
    rect.setVisibility(isVisible);
  };
    // executer.periodical(100);
  workspace.addItAsChildTo($('#visibility'));
};
visibilityTest();
