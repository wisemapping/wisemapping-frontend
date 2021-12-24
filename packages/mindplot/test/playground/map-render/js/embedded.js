import '../css/embedded.less';
import { buildDesigner, buildOptions } from '../../../../src/components/DesignerBuilder';
import { PersistenceManager, LocalStorageManager } from '../../../../src';

// Options has been defined in by a external ile ?
const p = new LocalStorageManager('samples/{id}.xml');
const options = buildOptions({ persistenceManager: p });
const designer = buildDesigner(options);

designer.addEvent('loadSuccess', () => {
  document.getElementById('mindplot').classList.add('ready');
});

// Load map from XML file persisted on disk...
const mapId = 'welcome';
const persistence = PersistenceManager.getInstance();
const mindmap = persistence.load(mapId);
designer.loadMap(mindmap);
