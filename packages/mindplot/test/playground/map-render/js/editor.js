import '../css/editor.less';
import { buildDesigner, buildOptions } from '../../../../src/components/DesignerBuilder';
import { PersistenceManager, LocalStorageManager } from '../../../../src';
import LoadingModal from '../../../../src/components/widget/LoadingModal';

const loadingModal = new LoadingModal();
loadingModal.show();

const p = new LocalStorageManager('samples/{id}.wxml');
const options = buildOptions({ persistenceManager: p });
const designer = buildDesigner(options);

designer.addEvent('loadSuccess', () => {
  loadingModal.hide();
  document.getElementById('mindplot').classList.add('ready');
});

const zoomInButton = document.getElementById('zoom-plus');
const zoomOutButton = document.getElementById('zoom-minus');

if (zoomInButton) {
  zoomInButton.addEventListener('click', () => {
    designer.zoomIn();
  });
}
if (zoomOutButton) {
  zoomOutButton.addEventListener('click', () => {
    designer.zoomOut();
  });
}

// Load map from XML file persisted on disk...
const mapId = 'welcome';
const persistence = PersistenceManager.getInstance();
const mindmap = persistence.load(mapId);
designer.loadMap(mindmap);
