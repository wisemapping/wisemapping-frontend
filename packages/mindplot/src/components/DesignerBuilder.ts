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
import $ from 'jquery';
import PersistenceManager from './PersistenceManager';
import Designer from './Designer';
import Menu from './widget/Menu';
import { $notifyModal } from './widget/ModalDialogNotifier';
import { $msg } from './Messages';
import { DesignerOptions } from './DesignerOptionsBuilder';

let designer: Designer;

export function buildDesigner(options: DesignerOptions): Designer {
  const divContainer = $(`#${options.container}`);
  $assert(divContainer, 'container could not be null');

  // Register load events ...
  designer = new Designer(options, divContainer);
  designer.addEvent('loadSuccess', () => {
    globalThis.mindmapLoadReady = true;
    console.log('Map loadded successfully');
  });

  const onerrorFn = () => {
    // Open error dialog only in case of mindmap loading errors. The rest of the error are reported but not display the dialog.
    // Remove this in the near future.
    if (!globalThis.mindmapLoadReady) {
      $notifyModal($msg('UNEXPECTED_ERROR_LOADING'));
    }
  };
  window.onerror = onerrorFn;

  // Configure default persistence manager ...
  const persistence = options.persistenceManager;
  $assert(persistence, 'persistence must be defined');
  PersistenceManager.init(persistence);

  // Register toolbar event ...
  if ($('#toolbar').length) {
    const menu = new Menu(designer, 'toolbar');

    //  If a node has focus, focus can be move to another node using the keys.
    designer.cleanScreen = () => {
      menu.clear();
    };
  }

  return designer;
}

export default buildDesigner;
