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
import EventDispispatcher from './EventDispatcher';
import type Topic from './Topic';
import MultitTextEditor from './MultilineTextEditor';
import type NodeModel from './model/NodeModel';
import type Designer from './Designer';

type TopicEventPayload = { model: NodeModel; readOnly: boolean };

/** The events of a topic the dispatcher does not handle itself. */
export type TopicEvents = { editnode: TopicEventPayload; clicknode: TopicEventPayload };

type TopicEventType = keyof TopicEvents;

class TopicEventDispatcher extends EventDispispatcher<TopicEvents> {
  private _readOnly: boolean;

  // The text editor of this dispatcher's designer: one per designer, so two maps on a page can
  // each have one open ...
  private _editor = new MultitTextEditor();

  constructor(readOnly: boolean) {
    super();
    this._readOnly = readOnly;
  }

  getTextEditor(): MultitTextEditor {
    return this._editor;
  }

  close(update: boolean): void {
    const editor = this._editor;
    if (editor.isActive()) {
      editor.close(update);
    }
  }

  /**
   * Closes the text editor without saving it, if it is open on a topic of `designer`.
   */
  closeFor(designer: Designer): void {
    const editor = this._editor;
    if (editor.getActiveTopic()?.getDesigner() === designer) {
      editor.close(false);
    }
  }

  show(topic: Topic, textOverwrite?: string): void {
    this.process('editnode', topic, textOverwrite);
  }

  process(eventType: TopicEventType, topic: Topic, textOverwrite?: string): void {
    // Close all previous open editor ....
    const editor = this._editor;
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
    return this._editor.isActive();
  }

  isEditingTopic(topic: Topic): boolean {
    const activeTopic = this._editor.getActiveTopic();
    return activeTopic === topic;
  }
}
export default TopicEventDispatcher;
