import $ from 'jquery';
import {
  Workspace, Rect,
} from '../../src';

global.$ = $;


const rectExampleTest = () => {
  const workspace = new Workspace();
  workspace.setSize('100px', '100px');
  workspace.setCoordSize(100, 100);
  workspace.setCoordOrigin(0, 0);

  const rect = new Rect();
  rect.setPosition(20, 20);

  workspace.append(rect);
  workspace.addItAsChildTo($('#rectExample'));
};
rectExampleTest();

const roundrectExampleTest = () => {
  function builder(container, x, width, height) {
    for (let i = 1; i <= 10; i++) {
      const rect = new Rect(i / 10);
      rect.setPosition(x, ((i - 1) * (50 + 5)));
      rect.setSize(width, height);
      container.append(rect);
    }
  }

  // 50 x 50
  const workspace = new Workspace();
  workspace.setSize('500px', '550px');
  workspace.setCoordOrigin(0, -4);
  workspace.setCoordSize(500, 550);
  workspace.addItAsChildTo($('#roundRect'));

  builder(workspace, 10, 50, 50);

  // 100 x 50
  builder(workspace, 70, 100, 50);

  // 200 x 50
  builder(workspace, 180, 200, 50);
};
roundrectExampleTest();
