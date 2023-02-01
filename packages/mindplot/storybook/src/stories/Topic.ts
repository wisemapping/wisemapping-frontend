import $ from 'jquery';

import { LinkModel, Mindmap, NoteModel, Topic } from '../../../src';
import NodeModel from '../../../src/components/model/NodeModel';
import CentralTopic from '../../../src/components/CentralTopic';
import Workspace from '../../../src/components/Workspace';
import ScreenManager from '../../../src/components/ScreenManager';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import TopicEventDispatcher from '../../../src/components/TopicEventDispatcher';

const registerRefreshHook = (topic: Topic) => {
  // Trigger a redraw after the node is added ...
  if (globalThis.observer) {
    globalThis.observer.disconnect();
  }

  globalThis.observer = new MutationObserver(() => {
    topic.redraw();
    console.log('Refresh triggered...');
  });
  globalThis.observer.observe(document.getElementById('root')!, { childList: true });
};

export type TopicArgs = {
  readOnly?: boolean;
  backgroundColor?: string;
  fontFamily?: string;
  borderColor?: string;
  fontSize?: number;
  fontColor?: string;
  shapeType?: 'rectangle' | 'rounded rectangle' | 'elipse' | 'line';
  text?: string;
  noteText?: string;
  linkText?: string;
  eicon?: string[];
};

const createTopic = ({
  backgroundColor = undefined,
  text = undefined,
  borderColor = undefined,
  shapeType = undefined,
  fontFamily = undefined,
  fontSize = undefined,
  fontColor = undefined,
  noteText = undefined,
  linkText = undefined,
  eicon = undefined,
  readOnly = true,
}: TopicArgs) => {
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
  const workspace = new Workspace(screenManager, 0.3, readOnly);
  TopicEventDispatcher.configure(readOnly);

  // Update model ...
  const mindmap = new Mindmap();
  const model = new NodeModel('CentralTopic', mindmap);
  model.setText(text);
  model.setBackgroundColor(backgroundColor);
  model.setBorderColor(borderColor);
  model.setShapeType(shapeType);
  model.setFontColor(fontColor);
  model.setFontFamily(fontFamily);
  model.setFontSize(fontSize);
  model.setShapeType(shapeType);

  if (noteText) {
    const note = new NoteModel({ text: noteText });
    model.addFeature(note);
  }

  if (linkText) {
    const note = new LinkModel({ url: linkText });
    model.addFeature(note);
  }

  if (eicon) {
    (eicon as string[]).forEach((icon) => {
      const emodel = new EmojiIconModel({ id: icon });
      model.addFeature(emodel);
    });
  }

  // Create topic UI element ...
  mindmap.addBranch(model);
  const centralTopic = new CentralTopic(model, { readOnly });
  workspace.append(centralTopic);

  // Register refresh hook ..
  registerRefreshHook(centralTopic);

  return divElem;
};

export default createTopic;
