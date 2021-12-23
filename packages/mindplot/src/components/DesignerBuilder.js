/*
 *    Copyright [2015] [wisemapping]
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
import $notifyModal from './widget/ModalDialogNotifier';
import { $msg } from './Messages';

global.jQuery = $;
global.$ = $;

let designer = null;

export function buildDesigner(options) {
  const container = $(`#${options.container}`);
  $assert(container, 'container could not be null');

  // Register load events ...
  designer = new Designer(options, container);
  designer.addEvent('loadSuccess', () => {
    window.mindmapLoadReady = true;
    console.log('Map loadded successfully');
  });

  const onerrorFn = (message, url, lineNo) => {
    // Close loading dialog ...
    if (window.waitDialog) {
      window.waitDialog.close();
      window.waitDialog = null;
    }

    // Open error dialog only in case of mindmap loading errors. The rest of the error are reported but not display the dialog.
    // Remove this in the near future.
    if (!window.mindmapLoadReady) {
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
    const menu = new Menu(designer, 'toolbar', options.mapId, '');

    //  If a node has focus, focus can be move to another node using the keys.
    designer._cleanScreen = function _cleanScreen() {
      menu.clear();
    };
  }

  return designer;
}

export function buildDefaultOptions(persistence, readOnly = false) {
  $assert(persistence, 'persistence must be defined');
  // Set workspace screen size as default. In this way, resize issues are solved.
  const containerSize = {
    height: Number.parseInt(window.screen.height, 10),
    width: Number.parseInt(window.screen.width, 10),
  };

  const viewPort = {
    height: Number.parseInt(window.innerHeight - 70, 10), // Footer and Header
    width: Number.parseInt(window.innerWidth, 10),
  };
  return {
    readOnly,
    zoom: 0.85,
    saveOnLoad: true,
    size: containerSize,
    viewPort,
    container: 'mindplot',
    locale: 'en',
    persistenceManager: persistence,
  };
}

export async function loadOptions(jsonConf, persistence, readOnly = false) {
  const result = await $.ajax({
    url: jsonConf,
    dataType: 'json',
    method: 'get',
  });
  result.readOnly = readOnly;
  result.persistenceManager = persistence;
  return result;
}

export function loadExample(exampleFn) {
  $(() => {
    // eslint-disable-next-line import/no-extraneous-dependencies
    import('@libraries/bootstrap').then(exampleFn);
  });
}
