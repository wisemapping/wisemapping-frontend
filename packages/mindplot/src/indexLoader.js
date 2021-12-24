/* eslint-disable vars-on-top */
import { $notify } from '@wisemapping/core-js';
import jquery from 'jquery';

import { buildDesigner, buildOptions } from './components/DesignerBuilder';
import RESTPersistenceManager from './components/RestPersistenceManager';
import PersistenceManager from './components/PersistenceManager';
import LocalStorageManager from './components/LocalStorageManager';

global.jQuery = jquery;
var jQuery = jquery;
console.log(jQuery);

require('@libraries/bootstrap/js/bootstrap');
require('@libraries/bootstrap/js/bootstrap-colorpicker');

// Configure designer options ...
let p;
if (!global.memoryPersistence && !global.readOnlyMode) {
  p = new RESTPersistenceManager(
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
  p = new LocalStorageManager('/c/restful/maps/{id}', true);
}

const options = buildOptions({ persistenceManager: p, isReadOnly: global.isReadOnly || false });
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
  $notify(global.mindmapLockedMsg, false);
}
