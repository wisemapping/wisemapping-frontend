import $ from 'jquery';

import { LinkModel, Mindmap, NoteModel, Topic } from '../../../src';
import NodeModel from '../../../src/components/model/NodeModel';
import CentralTopic from '../../../src/components/CentralTopic';
import Workspace from '../../../src/components/Workspace';
import ScreenManager from '../../../src/components/ScreenManager';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';

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
}) => {
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
  const workspace = new Workspace(screenManager, 0.3, true);

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
  const centralTopic = new CentralTopic(model, { readOnly: true });
  workspace.append(centralTopic);

  // Register refresh hook ..
  registerRefreshHook(centralTopic);

  return divElem;
};

export default createTopic;
