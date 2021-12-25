/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
/* eslint-disable vars-on-top */
import jquery from 'jquery';
import { $notify } from './components/widget/ToolbarNotifier';
import { buildDesigner, buildOptions } from './components/DesignerBuilder';
import RESTPersistenceManager from './components/RestPersistenceManager';
import PersistenceManager from './components/PersistenceManager';
import LocalStorageManager from './components/LocalStorageManager';

// This hack is required to initialize Bootstrap. In future, this should be removed.
global.jQuery = jquery;
require('@libraries/bootstrap/js/bootstrap');

// Configure designer options ...
let persistence;
if (!global.memoryPersistence && !global.readOnlyMode) {
  persistence = new RESTPersistenceManager(
    {
      documentUrl: '/c/restful/maps/{id}/document',
      revertUrl: '/c/restful/maps/{id}/history/latest',
      lockUrl: '/c/restful/maps/{id}/lock',
      timestamp: global.lockTimestamp,
      session: global.lockSession,
    },
  );
} else {
  // @todo: review ...
  // persistenceManager = new LocalStorageManager('c/restful/maps/{id}${hid != null ? '/' : ''}${hid != null ? hid : ''}/document/xml${principal != null ? '' : '-pub'}", true);
  persistence = new LocalStorageManager('/c/restful/maps/{id}', true);
}

const options = buildOptions({
  persistenceManager: persistence,
  readOnly: global.readOnly || false,
  mapId: global.mapId,
  zoom: global.userOptions.zoom,
});

// Build designer ...
const designer = buildDesigner(options);

// Load map from XML file persisted on disk...
const instance = PersistenceManager.getInstance();
const mindmap = instance.load(global.mapId);
designer.loadMap(mindmap);

if (global.mindmapLocked) {
  $notify(global.mindmapLockedMsg, false);
}
