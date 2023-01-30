import Workspace from '../../../src/components/Workspace';
import Elipse from '../../../src/components/Elipse';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Workspace',
  argTypes: {
    enableAnimation: { control: 'boolean' },
  },
};

export const Visibility = () => {
  const container = document.createElement('div');

  const overflowWorkspace = new Workspace();
  overflowWorkspace.setSize('400px', '400px');
  const elipse1 = new Elipse();
  elipse1.setSize(300, 300);
  elipse1.setPosition(0, 0);
  overflowWorkspace.append(elipse1);

  const div = document.createElement('div');
  container.append(div);
  overflowWorkspace.addItAsChildTo(div);

  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = `The Workspace's size defines the visible work area. If an element is outside the workspace, it must not be visible. In this example, The back circle is bigger than the workspace area. A big portion of the circle will not be displayed.`;
  container.append(span);

  return container;
};

export const Position = () => {
  const container = document.createElement('div');

  const elipseAttr = {
    width: 100,
    height: 100,
    x: 100,
    y: 100,
  };

  const div = document.createElement('div');
  container.append(div);

  const workPosition = new Workspace();
  workPosition.setSize('400px', '400px');

  const elipse = new Elipse(elipseAttr);
  workPosition.append(elipse);
  workPosition.addItAsChildTo(div);

  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = 'Workspace is added as child of a div element. That\'s why, It\'s parent will define this position.';
  container.append(span);

  return container;
};

export const CoordsSize = (args) => {
  const { enableAnimation } = args;

  const container = document.createElement('div');

  const coordSizeSampleBuilder = (width, height) => {
    const workspace = new Workspace();
    workspace.setSize('100px', '100px');
    workspace.setCoordSize(width, height);

    let elipse = new Elipse();
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

  const div = document.createElement('div');
  container.append(div);

  const workspace100x100 = coordSizeSampleBuilder(100, 100);
  workspace100x100.addItAsChildTo(div);

  const workspace100x200 = coordSizeSampleBuilder(100, 200);
  workspace100x200.addItAsChildTo(div);

  const workspace200x100 = coordSizeSampleBuilder(200, 100);
  workspace200x100.addItAsChildTo(div);

  const dynamicWorkspace = coordSizeSampleBuilder(100, 100);
  dynamicWorkspace.addItAsChildTo(div);

  let size = 100;
  if (enableAnimation) {
    const executer = () => {
      size = (size + 1) % 100;
      if (size < 30) {
        size = 30;
      }

      dynamicWorkspace.setCoordSize(size, size);
    };
    setInterval(executer, 200);
  }
  dynamicWorkspace.setCoordSize(size, size);

  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = `Workspace coordsize defines how many units there are along the width of the containing block.
  In all the examples,the coordsize of the workspaces have been set to (100,100) and the circles have been
  positioned
  at (0,0),(0,100),(100,0),(100,100)(50,50).<br />
  <br />
  1) Workspace with CoordSize(100,100)<br />
  2) Workspace with CoordSize(100,200)<br />
  3) Workspace with CoordSize(200,100)<br />
  4) Workspace animation changing the coordsize from (30,30) to (100,100)<br />`;
  container.append(span);

  return container;
};

export const CoordsOrigin = (args) => {
  const container = document.createElement('div');
  const { enableAnimation } = args;

  const coordOriginSampleBuilder = (x, y) => {
    // Workspace with CoordOrigin(100,100);
    const workspace = new Workspace();
    workspace.setSize('100px', '100px');
    workspace.setCoordSize(100, 100);
    workspace.setCoordOrigin(x, y);

    let elipse = new Elipse();
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

  const div = document.createElement('div');
  container.append(div);

  const workspace0x0 = coordOriginSampleBuilder(0, 0);
  workspace0x0.addItAsChildTo(div);

  const workspace0x50 = coordOriginSampleBuilder(0, 50);
  workspace0x50.addItAsChildTo(div);

  const workspace50x0 = coordOriginSampleBuilder(50, 0);
  workspace50x0.addItAsChildTo(div);

  // Workspace animation changing the coordsize from (30,30) to (100,100)
  const dynamicWorkspace = coordOriginSampleBuilder(100, 100);
  dynamicWorkspace.addItAsChildTo(div);
  if (enableAnimation) {
    let x = 50;
    let y = 50;
    const executer = () => {
      x = (x + 1) % 50;
      y = (y + 1) % 50;

      dynamicWorkspace.setCoordOrigin(x, y);
    };
    setInterval(executer, 100);
  }
  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = `Workspace coordorigin defines the coordinate at the top left corner of the containing block.
  In all the examples,the coordsize of the workspaces have been set to (100,100) and the circles have been
  positioned
  at (0,0),(0,100),(100,0),(100,100)(50,50). <br />
  <br />
  1) Workspace with CoordOrigin(0,0)<br />
  2) Workspace with CoordOrigin(0,50)<br />
  3) Workspace with CoordOrigin(50,0)<br />
  4) Workspace animation changing the coordorigin from (0,0) to (50,50)<br />`;
  container.append(span);

  return container;
};
