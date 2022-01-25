import '../css/embedded.css';
import { buildDesigner } from '../../../../src/components/DesignerBuilder';
import { PersistenceManager, LocalStorageManager } from '../../../../src';
import DesignerOptionsBuilder from '../../../../src/components/DesignerOptionsBuilder';

// Options has been defined in by a external ile ?
const p = new LocalStorageManager('samples/{id}.wxml');
const options = DesignerOptionsBuilder.buildOptions({ persistenceManager: p });
const designer = buildDesigner(options);

designer.addEvent('loadSuccess', () => {
  document.getElementById('mindplot').classList.add('ready');
});

// Load map from XML file persisted on disk...
const mapId = 'welcome';
const persistence = PersistenceManager.getInstance();
const mindmap = persistence.load(mapId);
designer.loadMap(mindmap);
