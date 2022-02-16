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
import { $msg } from '../Messages';
import PersistenceManager from '../PersistenceManager';
import { $notify } from './ToolbarNotifier';
import { $notifyModal } from './ModalDialogNotifier';
import Designer from '../Designer';
import ToolbarItem from './ToolbarItem';

class IMenu {
  private _designer: Designer;

  protected _toolbarElems: ToolbarItem[];

  private _mindmapUpdated: boolean;

  constructor(designer: Designer, containerId: string) {
    $assert(designer, 'designer can not be null');
    $assert(containerId, 'containerId can not be null');

    this._designer = designer;
    this._toolbarElems = [];
    this._mindmapUpdated = false;
    const me = this;

    // Register update events ...
    this._designer.addEvent('modelUpdate', () => {
      me.setRequireChange(true);
    });
  }

  clear() {
    this._toolbarElems.forEach((item) => {
      item.hide();
    });
  }

  discardChanges(designer: Designer) {
    // Avoid autosave before leaving the page ....
    this.setRequireChange(false);

    // Finally call discard function ...
    const persistenceManager = PersistenceManager.getInstance();
    const mindmap = designer.getMindmap();
    persistenceManager.discardChanges(mindmap.getId());

    // Unlock map ...
    this.unlockMap(designer);

    // Reload the page ...
    window.location.reload();
  }

  unlockMap(designer: Designer) {
    const mindmap = designer.getMindmap();
    const persistenceManager = PersistenceManager.getInstance();

    // If the map could not be loaded, partial map load could happen.
    if (mindmap) {
      persistenceManager.unlockMap(mindmap.getId());
    }
  }

  save(saveElem: JQuery, designer: Designer, saveHistory: boolean) {
    // Load map content ...
    const mindmap = designer.getMindmap();
    const mindmapProp = designer.getMindmapProperties();

    // Display save message ..
    if (saveHistory) {
      $notify($msg('SAVING'));
      saveElem.css('cursor', 'wait');
    }

    // Call persistence manager for saving ...
    const menu = this;
    const persistenceManager = PersistenceManager.getInstance();
    persistenceManager.save(mindmap, mindmapProp, saveHistory, {
      onSuccess() {
        if (saveHistory) {
          saveElem.css('cursor', 'pointer');
          $notify($msg('SAVE_COMPLETE'));
        }
        menu.setRequireChange(false);
      },
      onError(error) {
        if (saveHistory) {
          saveElem.css('cursor', 'pointer');

          if (error.severity !== 'FATAL') {
            $notify(error.message);
          } else {
            $notifyModal(error.message);
          }
        }
      },
    });
  }

  isSaveRequired(): boolean {
    return this._mindmapUpdated;
  }

  setRequireChange(value: boolean) {
    this._mindmapUpdated = value;
  }
}

export default IMenu;
