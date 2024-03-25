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
import EventDispispatcher from './EventDispatcher';
import Topic from './Topic';
import MultitTextEditor from './MultilineTextEditor';

type TopicEventType = 'editnode' | 'clicknode';

class TopicEventDispatcher extends EventDispispatcher<TopicEventType> {
  private _readOnly: boolean;

  // eslint-disable-next-line no-use-before-define
  private static _instance: TopicEventDispatcher;

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

  show(topic: Topic, textOverwrite?: string): void {
    this.process('editnode', topic, textOverwrite);
  }

  process(eventType: TopicEventType, topic: Topic, textOverwrite?: string): void {
    // Close all previous open editor ....
    const editor = MultitTextEditor.getInstance();
    if (editor.isActive()) {
      this.close(false);
    }

    // Open the new editor ...
    const model = topic.getModel();
    if (!this._readOnly && eventType === 'editnode') {
      editor.show(topic, textOverwrite);
    } else {
      this.fireEvent(eventType, { model, readOnly: this._readOnly });
    }
  }

  isVisible(): boolean {
    return MultitTextEditor.getInstance().isActive();
  }

  static configure(readOnly: boolean): TopicEventDispatcher {
    if (this._instance) {
      throw new Error('events already initialized');
    }

    this._instance = new TopicEventDispatcher(readOnly);
    return this._instance;
  }

  static getInstance(): TopicEventDispatcher {
    if (!this._instance) {
      throw new Error('Event dispatched has not been initialized');
    }
    return this._instance;
  }
}
export default TopicEventDispatcher;
