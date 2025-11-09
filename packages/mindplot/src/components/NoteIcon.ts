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
import { $assert } from './util/assert';
import NotesImage from '../../assets/icons/notes.svg';
import Topic from './Topic';
import NoteModel from './model/NoteModel';
import FeatureModel from './model/FeatureModel';
import ImageIcon from './ImageIcon';
import ActionDispatcher from './ActionDispatcher';

class NoteIcon extends ImageIcon {
  private _noteModel: NoteModel;

  private _topic: Topic;

  private _readOnly: boolean;

  constructor(topic: Topic, noteModel: NoteModel, readOnly: boolean) {
    $assert(topic, 'topic can not be null');

    super(NoteIcon.IMAGE_URL);
    this._noteModel = noteModel;
    this._topic = topic;
    this._readOnly = readOnly;

    this._registerEvents();
  }

  private _registerEvents(): void {
    this.getElement().setCursor('pointer');
    const topic = this._topic;

    // Hover tooltip ...
    const designerInstance = (globalThis as Record<string, unknown>).designer as
      | {
          getWidgeManager: () => { configureTooltipForNode: (...args: unknown[]) => void };
          fireEvent: (...args: unknown[]) => void;
        }
      | undefined;

    if (!designerInstance) {
      console.warn('NoteIcon: designer not provided. Tooltips will be disabled.');
      return;
    }

    const wm = designerInstance.getWidgeManager();
    wm.configureTooltipForNode(this._topic, this._noteModel, this);

    // Register edition popup ...
    if (!this._readOnly) {
      this.getElement().addEvent('click', (evt) => {
        designerInstance.fireEvent('featureEdit', { event: 'note', topic });
        evt.stopPropagation();
      });
    }
  }

  getModel(): FeatureModel {
    return this._noteModel;
  }

  remove() {
    const actionDispatcher = ActionDispatcher.getInstance();
    const featureId = this._noteModel.getId();
    actionDispatcher.removeFeatureFromTopic(this._topic.getId(), featureId);
  }

  static IMAGE_URL = NotesImage;
}

export default NoteIcon;
