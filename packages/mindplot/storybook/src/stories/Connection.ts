import $ from 'jquery';

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
import EventBus from '../../../src/components/layout/EventBus';

const registerRefreshHook = (topics: Topic[]) => {
  // Trigger a redraw after the node is added ...
  if (globalThis.observer) {
    globalThis.observer.disconnect();
  }

  globalThis.observer = new MutationObserver(() => {
    // Relayout...
    topics.forEach((t) => t.redraw());
    EventBus.instance.fireEvent('forceLayout');
  });
  globalThis.observer.observe(document.getElementById('root')!, { childList: true });
};

export type TopicArgs = {
  readOnly?: boolean;
  theme?: ThemeType;
};

const createConnection = ({ theme = undefined, readOnly = true }: TopicArgs) => {
  // Build basic container ...
  const divElem = document.createElement('div');
  const jqueryDiv = $(divElem);
  jqueryDiv.css({
    height: '600px',
    width: '800px',
    backgroundColor: 'gray',
  });

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
  child1.setText('This is child one !\nwith other line');
  child1.setPosition(100, 100);

  const child2 = new NodeModel('MainTopic', mindmap);
  child2.setOrder(1);
  child2.setPosition(100, -100);

  const child3 = new NodeModel('MainTopic', mindmap);
  child3.setOrder(0);
  child3.setPosition(-100, 100);

  const child4 = new NodeModel('MainTopic', mindmap);
  child4.setOrder(1);
  child4.setPosition(-100, -100);

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
  const centralTopic = new CentralTopic(central, { readOnly });

  const child1Topic = new MainTopic(child1, { readOnly });
  const child2Topic = new MainTopic(child2, { readOnly });
  const child3Topic = new MainTopic(child3, { readOnly });
  const child4Topic = new MainTopic(child4, { readOnly });
  const subchild1Topic = new MainTopic(subchild1, { readOnly });
  const subchild2Topic = new MainTopic(subchild2, { readOnly });
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
    const topic = topics.filter((t) => t.getModel().getId() === id)[0];

    topic.setPosition(event.getPosition());
    topic.setOrder(event.getOrder());
  });

  // Add to canvas ...
  topics.forEach((t) => canvas.append(t));

  // Connect nodes ...
  child1Topic.connectTo(centralTopic, canvas);
  child2Topic.connectTo(centralTopic, canvas);
  child3Topic.connectTo(centralTopic, canvas);
  child4Topic.connectTo(centralTopic, canvas);
  subchild1Topic.connectTo(child1Topic, canvas);
  subchild2Topic.connectTo(child1Topic, canvas);

  // Register refresh hook ..
  registerRefreshHook(topics);

  return divElem;
};

export default createConnection;
