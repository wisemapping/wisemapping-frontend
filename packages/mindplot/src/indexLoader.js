import { $notify } from '@wisemapping/core-js';
import { buildDesigner, loadDesignerOptions } from './components/DesignerBuilder';
import LocalStorageManager from './components/LocalStorageManager';
import RESTPersistenceManager from './components/RestPersistenceManager';
import PersistenceManager from './components/PersistenceManager';

global.memoryPersistence = false;
global.readOnlyMode = false;
global.userOptions = {};
global.locale = 'us';
global.mindmapLocked = false;
global.mapLockedMessage = 'map locked';
global.lockSession = 111111;
global.lockTimestamp = 11111;

// Configure designer options ...
const options = loadDesignerOptions();

if (!global.memoryPersistence && !global.readOnlyMode) {
  options.persistenceManager = new RESTPersistenceManager(
    {
      documentUrl: 'c/restful/maps/{id}/document',
      revertUrl: 'c/restful/maps/{id}/history/latest',
      lockUrl: 'c/restful/maps/{id}/lock',
      timestamp: global.lockTimestamp,
      session: global.lockSession,
    },
  );
} else {
//   options.persistenceManager = new LocalStorageManager("c/restful/maps/{id}${hid != null ? '/' : ''}${hid != null ? hid : ''}/document/xml${principal != null ? '' : '-pub'}", true);
}

options.zoom = global.userOptions.zoom;
options.readOnly = false;

// Set map id ...
options.mapId = global.mapId;

// Build designer ...
const designer = buildDesigner(options);

// Load map from XML file persisted on disk...
const persistence = PersistenceManager.getInstance();
const mindmap = persistence.load(global.mapId);
designer.loadMap(mindmap);

if (global.mindmapLocked) {
  $notify(global.mappL, false);
}
