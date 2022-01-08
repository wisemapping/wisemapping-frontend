/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
/* eslint-disable vars-on-top */
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
import jquery from 'jquery';
import {
  $notify,
} from './components/widget/ToolbarNotifier';
import LoadingModal from './components/widget/LoadingModal';
import {
  buildDesigner,
  buildOptions,
} from './components/DesignerBuilder';
import RESTPersistenceManager from './components/RestPersistenceManager';
import PersistenceManager from './components/PersistenceManager';
import LocalStorageManager from './components/LocalStorageManager';

// This hack is required to initialize Bootstrap. In future, this should be removed.
global.jQuery = jquery;
require('@libraries/bootstrap/js/bootstrap');

const loadingModal = new LoadingModal();
loadingModal.show();

// Configure designer options ...
let persistence;
if (!global.memoryPersistence && !global.readOnly) {
  persistence = new RESTPersistenceManager({
    documentUrl: '/c/restful/maps/{id}/document',
    revertUrl: '/c/restful/maps/{id}/history/latest',
    lockUrl: '/c/restful/maps/{id}/lock',
    timestamp: global.lockTimestamp,
    session: global.lockSession,
  });
} else {
  persistence = new LocalStorageManager(`/c/restful/maps/{id}/${global.historyId ? `${global.historyId}/` : ''}document/xml${!global.isAuth ? '-pub' : ''}`, true);
}

// Obtain map zoom from query param if it was specified...
const params = new URLSearchParams(window.location.search.substring(1));

const zoomParam = Number.parseFloat(params.get('zoom'), 10);
const options = buildOptions({
  persistenceManager: persistence,
  readOnly: global.readOnly || false,
  mapId: global.mapId,
  zoom: zoomParam || global.userOptions.zoom,
});

// Build designer ...
const designer = buildDesigner(options);

designer.addEvent('loadSuccess', () => {
  loadingModal.hide();
});

// Load map from XML file persisted on disk...
const instance = PersistenceManager.getInstance();
const mindmap = instance.load(global.mapId);
designer.loadMap(mindmap);

if (global.mindmapLocked) {
  $notify(global.mindmapLockedMsg, false);
}
