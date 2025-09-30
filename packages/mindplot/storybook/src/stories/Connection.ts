// jQuery removed - using native DOM APIs

import { Mindmap, Topic } from '../../../src';
import NodeModel from '../../../src/components/model/NodeModel';
import CentralTopic from '../../../src/components/CentralTopic';
import Canvas from '../../../src/components/Canvas';
import ScreenManager from '../../../src/components/ScreenManager';
import TopicEventDispatcher from '../../../src/components/TopicEventDispatcher';
import ThemeType from '../../../src/components/model/ThemeType';
import MainTopic from '../../../src/components/MainTopic';
import EventBusDispatcher from '../../../src/components/layout/EventBusDispatcher';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import ChangeEvent from '../../../src/components/layout/ChangeEvent';
import LayoutEventBus from '../../../src/components/layout/LayoutEventBus';
import { $assert } from '@wisemapping/core-js';

const registerRefreshHook = (topics: Topic[]) => {
  // Trigger a redraw after the node is added ...
  if (globalThis.observer) {
    globalThis.observer.disconnect();
  }

  globalThis.observer = new MutationObserver(() => {
    // Relayout...
    topics.forEach((t) => t.redraw(t.getThemeVariant(), false)); // Use actual theme variant
    LayoutEventBus.fireEvent('forceLayout');
  });
  const rootElement = document.getElementById('root') || document.body;
  globalThis.observer.observe(rootElement, { childList: true });
};

export type TopicArgs = {
  readOnly?: boolean;
  theme?: ThemeType;
};

const createConnection = ({ theme = undefined, readOnly = true }: TopicArgs) => {
  // Build basic container ...
  const divElem = document.createElement('div');
  divElem.style.height = '600px';
  divElem.style.width = '800px';
  divElem.style.backgroundColor = 'gray';

  // Initialize designer helpers ...
  const screenManager = new ScreenManager(divElem);
  const canvas = new Canvas(screenManager, 0.7, readOnly);
  TopicEventDispatcher.configure(readOnly);

  // Register event propagation ..
  const mindmap = new Mindmap();
  const central = new NodeModel('CentralTopic', mindmap);
  central.setText('Central Topic');
  mindmap.addBranch(central);

  // Add Children ...
  const child1 = new NodeModel('MainTopic', mindmap);
  child1.setOrder(0);
  child1.setText('Child1: This is child one !\nwith other line');
  child1.setPosition(100, 100);

  const child2 = new NodeModel('MainTopic', mindmap);
  child2.setOrder(1);
  child2.setPosition(100, -100);
  child2.setText('Child2');

  const child3 = new NodeModel('MainTopic', mindmap);
  child3.setOrder(2);
  child3.setPosition(-100, 100);
  child3.setText('Child3');

  const child4 = new NodeModel('MainTopic', mindmap);
  child4.setOrder(3);
  child4.setPosition(-100, -100);
  child3.setText('Child4');

  const subchild1 = new NodeModel('MainTopic', mindmap);
  subchild1.setOrder(0);
  subchild1.setPosition(300, 80);

  const subchild2 = new NodeModel('MainTopic', mindmap);
  subchild2.setOrder(1);
  subchild2.setPosition(300, 120);

  // Theme ...
  if (theme) {
    mindmap.setTheme(theme);
  }

  // Create and add to canvas..
  const centralTopic = new CentralTopic(central, { readOnly }, 'light'); // Default to light for storybook

  const child1Topic = new MainTopic(child1, { readOnly }, 'light'); // Default to light for storybook
  const child2Topic = new MainTopic(child2, { readOnly }, 'light'); // Default to light for storybook
  const child3Topic = new MainTopic(child3, { readOnly }, 'light'); // Default to light for storybook
  const child4Topic = new MainTopic(child4, { readOnly }, 'light'); // Default to light for storybook
  const subchild1Topic = new MainTopic(subchild1, { readOnly }, 'light'); // Default to light for storybook
  const subchild2Topic = new MainTopic(subchild2, { readOnly }, 'light'); // Default to light for storybook

  const topics = [
    child1Topic,
    child2Topic,
    child3Topic,
    child4Topic,
    centralTopic,
    subchild1Topic,
    subchild2Topic,
  ];

  // Configure event dispatcher ...
  const dispatcher = new EventBusDispatcher();
  const size = { width: 25, height: 25 };
  const layoutManager = new LayoutManager(mindmap.getCentralTopic().getId(), size);
  dispatcher.setLayoutManager(layoutManager);

  layoutManager.addEvent('change', (event: ChangeEvent) => {
    const id = event.getId();
    const ids = topics.filter((t) => t.getModel().getId() === id);
    $assert(ids.length === 1, `Unexpeted number of elements ${String(ids)} - ${id}`);
    const topic = ids[0];

    const position = event.getPosition();
    const order = event.getOrder();
    if (position) {
      topic.setPosition(position);
    }
    if (order !== null) {
      topic.setOrder(order);
    }
  });

  // Connect nodes ...
  canvas.append(centralTopic);

  child1Topic.connectTo(centralTopic, canvas);
  canvas.append(child1Topic);

  child2Topic.connectTo(centralTopic, canvas);
  canvas.append(child2Topic);

  child3Topic.connectTo(centralTopic, canvas);
  canvas.append(child3Topic);

  child4Topic.connectTo(centralTopic, canvas);
  canvas.append(child4Topic);

  subchild1Topic.connectTo(child1Topic, canvas);
  canvas.append(subchild1Topic);

  subchild2Topic.connectTo(child1Topic, canvas);
  canvas.append(subchild2Topic);

  // Register refresh hook ..
  registerRefreshHook(topics);

  return divElem;
};

export default createConnection;
