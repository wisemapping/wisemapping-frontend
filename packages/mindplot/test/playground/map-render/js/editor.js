import '../css/editor.css';
import { buildDesigner } from '../../../../src/components/DesignerBuilder';
import { PersistenceManager, LocalStorageManager } from '../../../../src';
import DesignerOptionsBuilder from '../../../../src/components/DesignerOptionsBuilder';

// Account details ...
global.accountName = 'Test User';
global.accountEmail = 'test@example.com';

const p = new LocalStorageManager('samples/{id}.wxml');
const options = DesignerOptionsBuilder.buildOptions({
  persistenceManager: p,
});
const designer = buildDesigner(options);

designer.addEvent('loadSuccess', () => {
  // Hack for automation testing ...
  document.getElementById('mindplot').classList.add('ready');
});

// Load map from XML file persisted on disk...
const mapId = 'welcome';
const persistence = PersistenceManager.getInstance();
const mindmap = persistence.load(mapId);
designer.loadMap(mindmap);
