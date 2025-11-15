/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

// jQuery removed - using native DOM APIs

import { LinkModel, Mindmap, NoteModel, Topic } from '../../../src/index';
import NodeModel from '../../../src/components/model/NodeModel';
import CentralTopic from '../../../src/components/CentralTopic';
import Canvas from '../../../src/components/Canvas';
import ScreenManager from '../../../src/components/ScreenManager';
import EmojiIconModel from '../../../src/components/model/EmojiIconModel';
import TopicEventDispatcher from '../../../src/components/TopicEventDispatcher';
import { TopicShapeType } from '../../../src/components/model/INodeModel';
import ThemeType from '../../../src/components/model/ThemeType';

const ensureDesignerStub = () => {
  const globalDesigner = (globalThis as unknown as { designer?: unknown }).designer;
  if (!globalDesigner) {
    (globalThis as Record<string, unknown>).designer = {
      getWidgeManager: () => ({
        configureTooltipForNode: () => {},
        createTooltipForLink: () => {},
      }),
      fireEvent: () => {},
    };
  }
};

const registerRefreshHook = (topic: Topic) => {
  // Trigger a redraw after the node is added ...
  if (globalThis.observer) {
    globalThis.observer.disconnect();
  }

  globalThis.observer = new MutationObserver(() => {
    topic.redraw(topic.getThemeVariant(), false); // Use actual theme variant
    console.log('Refresh triggered...');
  });
  const rootElement = document.getElementById('root') || document.body;
  globalThis.observer.observe(rootElement, { childList: true });
};

export type TopicArgs = {
  readOnly?: boolean;
  backgroundColor?: string;
  fontFamily?: string;
  borderColor?: string;
  fontSize?: number;
  fontColor?: string;
  shapeType?: TopicShapeType;
  text?: string;
  noteText?: string;
  linkText?: string;
  eicon?: string[];
  imageEmojiChar?: string;
  theme?: ThemeType;
};

export type CreateTopicOptions = {
  onTopicCreated?: (topic: Topic, container: HTMLDivElement, workspace: Canvas) => void;
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
  imageEmojiChar = undefined,
  theme = undefined,
  readOnly = true,
}: TopicArgs, options?: CreateTopicOptions) => {
  ensureDesignerStub();
  // Build basic container ...
  const divElem = document.createElement('div');
  divElem.style.height = '600px';
  divElem.style.width = '800px';
  divElem.style.backgroundColor = 'gray';
  divElem.style.position = 'relative';

  // Initialize designer helpers ...
  const screenManager = new ScreenManager(divElem);
  const workspace = new Canvas(screenManager, 0.3, readOnly, true);
  const topicEventDispatcher = new TopicEventDispatcher(readOnly);

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

  if (imageEmojiChar) {
    model.setImageEmojiChar(imageEmojiChar);
  }

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

  // Theme ...
  if (theme) {
    mindmap.setTheme(theme);
  }

  // Create topic UI element ...
  mindmap.addBranch(model);
  const centralTopic = new CentralTopic(model, { readOnly, topicEventDispatcher }, 'light'); // Default to light for storybook
  workspace.append(centralTopic);

  // Register refresh hook ..
  registerRefreshHook(centralTopic);
  void workspace.enableQueueRender(false);

  if (options?.onTopicCreated) {
    options.onTopicCreated(centralTopic, divElem, workspace);
  }

  return divElem;
};

export default createTopic;
