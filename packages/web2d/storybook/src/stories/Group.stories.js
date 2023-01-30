import Group from '../../../src/components/Group';
import Workspace from '../../../src/components/Workspace';
import Elipse from '../../../src/components/Elipse';
import StraightLine from '../../../src/components/StraightLine';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Shapes/Group',
  argTypes: {
    onClick: { action: 'onClick' },
  },
};

export const Container = () => {
  const container = document.createElement('div');

  const div = document.createElement('div');
  container.append(div);

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(400, 400);
  workspace.setCoordOrigin(-200, -200);

  const group = new Group();
  group.setSize(200, 200);
  group.setPosition(-100, -100);
  group.setCoordSize(200, 200);
  group.setCoordOrigin(0, 0);
  workspace.append(group);

  const elipse = new Elipse();
  elipse.setSize(200, 200);
  elipse.setPosition(100, 100);
  group.append(elipse);

  let line = new StraightLine();
  line.setFrom(0, 0);
  line.setTo(200, 200);
  line.setStroke('blue');
  group.append(line);

  line = new StraightLine();
  line.setFrom(200, 0);
  line.setTo(0, 200);
  line.setStroke('blue');
  group.append(line);

  workspace.addItAsChildTo(div);

  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = 'A group object can be used to collect shapes. In this example, There is a group that contains an elipse and two lines as children. Changing the group position also change the position of all contained elements.';
  container.append(span);

  return container;
};

export const EventBubbling = (args) => {
  const { onClick } = args;
  const container = document.createElement('div');

  const div = document.createElement('div');
  container.append(div);

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(100, 100);

  const groupAttributes = {
    width: 50,
    height: 50,
    x: 25,
    y: 50,
    coordSize: '200 200',
    coordOrigin: '0 0',
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

  group.addEvent('click', onClick);
  elipseLeft.addEvent('click', onClick);
  elipseRight.addEvent('click', onClick);
  workspace.addItAsChildTo(div);

  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = 'Following the bubbling event pattern, all the events over a shape are propageted to its parent. In this example, both elipse objects are child of a group element and click event listeners have been added to the elipse and the group.';
  container.append(span);

  return container;
};

export const Nested = () => {
  const container = document.createElement('div');
  const div = document.createElement('div');
  container.append(div);

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(400, 400);
  workspace.setCoordOrigin(-100, -100);

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

  let line = new StraightLine();
  line.setFrom(0, 0);
  line.setTo(200, 200);
  line.setStroke('red');
  groupOuter.append(line);

  line = new StraightLine();
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

  line = new StraightLine();
  line.setFrom(0, 0);
  line.setTo(200, 200);
  line.setStroke('blue');
  groupInner.append(line);

  line = new StraightLine();
  line.setFrom(200, 0);
  line.setTo(0, 200);
  line.setStroke('blue');
  groupInner.append(line);
  workspace.addItAsChildTo(container);

  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = `Groups can be nested as a regular shape. An important property of the groups is the ability to define their own coordSize, coorOrigin and size. 
  In this example, both shapes have been created with the same properties. The red one has been added as a child element of a group with the following properties:

    Size(50,50);
    Position(25,25);
    CoordSize(100,100);
    CoordOrigin(0,0)
    The blue one has been added as a child of another group with the following properties::
    
    Size(50,50);
    Position(25,25);
    CoordSize(100,100);
    CoordOrigin(0,0);
    
    Finally, the second group has been added as a child of the first declared group.`;
  container.append(span);

  return container;
};

export const CoordSize = () => {
  const groupSampleBuilder = (width, height) => {
    // Group with CoordSize(50,50);
    const workspace = new Workspace();
    workspace.setSize('150px', '150px');
    workspace.setCoordSize(150, 150);
    workspace.setCoordOrigin(-20, -20);

    const elipseOuter = new Elipse();
    elipseOuter.setPosition(50, 50);
    elipseOuter.setSize(100, 100);
    workspace.append(elipseOuter);

    const group = new Group();
    group.setSize(100, 100);
    group.setCoordSize(width, height);
    group.setPosition(25, 25);
    workspace.append(group);

    const elipseInner = new Elipse();
    elipseInner.setPosition(50, 50);
    elipseInner.setSize(100, 100);
    elipseInner.setFill('red');
    group.append(elipseInner);

    return workspace;
  };

  const container = document.createElement('div');
  const div = document.createElement('div');
  container.append(div);

  const sample100x100 = groupSampleBuilder(100, 100);
  sample100x100.addItAsChildTo(div);

  const sample100x200 = groupSampleBuilder(100, 200);
  sample100x200.addItAsChildTo(div);

  const sample200x100 = groupSampleBuilder(200, 100);
  sample200x100.addItAsChildTo(div);

  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = `Group coordsize defines how many units there are along the width of the containing block.
  In all the examples, the coordsize of the workspaces have been set to (100,100) and the circles have
  been
  positioned
  at (0,0),(0,100),(100,0),(100,100)(50,50).
  1) Group with CoordSize(100,100)
  2) Group with CoordSize(100,200)
  3) Group with CoordSize(200,100)`;
  container.append(span);

  return container;
};

export const CoordOrigin = () => {
  const groupSampleBuilder = (x, y) => {
    const workspace = new Workspace();
    workspace.setSize('200px', '200px');
    workspace.setCoordSize(200, 200);
    workspace.setCoordOrigin(-30, -30);

    const elipseOuter = new Elipse();
    elipseOuter.setPosition(50, 50);
    elipseOuter.setSize(100, 100);
    workspace.append(elipseOuter);

    const group = new Group();
    group.setSize(100, 100);
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
  };

  const container = document.createElement('div');
  const div = document.createElement('div');
  container.append(div);

  const sample0x0 = groupSampleBuilder(0, 0);
  sample0x0.addItAsChildTo(div);

  const sample100x200 = groupSampleBuilder(0, 50);
  sample100x200.addItAsChildTo(div);

  const sample200x100 = groupSampleBuilder(50, 0);
  sample200x100.addItAsChildTo(div);

  // @todo: Move this to storybook doc ...
  const span = document.createElement('span');
  span.innerHTML = `Group coordorigin defines the coordinate at the top left corner of the containing block.
  In all the examples,the coordsize of the groups have been set to (100,100) and the circles have been
  positioned
  at (0,0),(0,100),(100,0),(100,100)(50,50).
  
  1) Group with CoordOrigin(0,0)
  2) Group with CoordOrigin(0,50)
  3) Group with CoordOrigin(50,0)`;
  container.append(span);

  return container;
};
