import { $notify } from '@wisemapping/core-js';
import { buildDesigner, buildDefaultOptions } from './components/DesignerBuilder';
import RESTPersistenceManager from './components/RestPersistenceManager';
import PersistenceManager from './components/PersistenceManager';
import LocalStorageManager from './components/LocalStorageManager';

global.memoryPersistence = false;
global.readOnlyMode = false;
global.userOptions = {};
global.locale = 'us';
global.mindmapLocked = false;
global.mapLockedMessage = 'map locked';
global.lockSession = 111111;
global.lockTimestamp = 11111;

// Configure designer options ...
let persistenceManager;
if (!global.memoryPersistence && !global.readOnlyMode) {
  persistenceManager = new RESTPersistenceManager(
    {
      documentUrl: 'c/restful/maps/{id}/document',
      revertUrl: 'c/restful/maps/{id}/history/latest',
      lockUrl: 'c/restful/maps/{id}/lock',
      timestamp: global.lockTimestamp,
      session: global.lockSession,
    },
  );
} else {
  // persistenceManager = new LocalStorageManager('c/restful/maps/{id}${hid != null ? '/' : ''}${hid != null ? hid : ''}/document/xml${principal != null ? '' : '-pub'}", true);
  // @todo: review ...
  persistenceManager = new LocalStorageManager('c/restful/maps/{id}', true);
}
const options = buildDefaultOptions(persistenceManager, false);
options.zoom = global.userOptions.zoom;

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
