/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { $assert } from '@wisemapping/core-js';
import Events from './Events';
import Topic from './Topic';
import MultitTextEditor from './MultilineTextEditor';

const TopicEvent = {
  EDIT: 'editnode',
  CLICK: 'clicknode',
};

class TopicEventDispatcher extends Events {
  private _readOnly: boolean;

  // eslint-disable-next-line no-use-before-define
  static _instance: TopicEventDispatcher;

  constructor(readOnly: boolean) {
    super();
    this._readOnly = readOnly;
  }

  close(update: boolean): void {
    const editor = MultitTextEditor.getInstance();
    if (editor.isActive()) {
      editor.close(update);
    }
  }

  show(topic: Topic, options?): void {
    this.process(TopicEvent.EDIT, topic, options);
  }

  process(eventType: string, topic: Topic, options?): void {
    $assert(eventType, 'eventType can not be null');

    // Close all previous open editor ....
    const editor = MultitTextEditor.getInstance();
    if (editor.isActive()) {
      this.close(false);
    }

    // Open the new editor ...
    const model = topic.getModel();
    if (model.getShapeType() !== 'image' && !this._readOnly && eventType === TopicEvent.EDIT) {
      editor.show(topic, options ? options.text : '');
    } else {
      this.fireEvent(eventType, { model, readOnly: this._readOnly });
    }
  }

  isVisible(): boolean {
    return MultitTextEditor.getInstance().isActive();
  }

  static configure(readOnly: boolean): void {
    this._instance = new TopicEventDispatcher(readOnly);
  }

  static getInstance(): TopicEventDispatcher {
    return this._instance;
  }
}

export { TopicEvent };
export default TopicEventDispatcher;
