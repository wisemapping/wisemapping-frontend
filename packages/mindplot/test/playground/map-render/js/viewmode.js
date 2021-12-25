import '../css/embedded.less';
import { buildDesigner, buildOptions } from '../../../../src/components/DesignerBuilder';
import { PersistenceManager, LocalStorageManager } from '../../../../src';

const p = new LocalStorageManager('samples/{id}.xml');
const options = buildOptions({ persistenceManager: p, readOnly: true, saveOnLoad: false });

// Obtain map id from query param
const params = new URLSearchParams(window.location.search.substring(1));
const mapId = params.get('id') || 'welcome';

const designer = buildDesigner(options);
designer.addEvent('loadSuccess', () => {
  document.getElementById('mindplot').classList.add('ready');
});

// Load map from XML file persisted on disk...
const persistence = PersistenceManager.getInstance();
const mindmap = persistence.load(mapId);
designer.loadMap(mindmap);
