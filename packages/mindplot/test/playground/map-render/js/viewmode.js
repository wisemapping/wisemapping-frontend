import '../css/viewmode.less';
import { buildDesigner, buildOptions } from '../../../../src/components/DesignerBuilder';
import { PersistenceManager, LocalStorageManager } from '../../../../src';

const p = new LocalStorageManager('samples/{id}.wxml');
const options = buildOptions({ persistenceManager: p, readOnly: true, saveOnLoad: false });

// Obtain map id from query param
const params = new URLSearchParams(window.location.search.substring(1));
const mapId = params.get('id') || 'welcome';

const designer = buildDesigner(options);
designer.addEvent('loadSuccess', () => {
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
const persistence = PersistenceManager.getInstance();
const mindmap = persistence.load(mapId);
designer.loadMap(mindmap);

// Code for selector of map.
const mapSelectElem = document.getElementById('map-select');
mapSelectElem.addEventListener('change', (e) => {
  const selectMap = e.target.value;
  window.location = `${window.location.pathname}?id=${selectMap}`;
});

Array.from(mapSelectElem.options).forEach((option) => {
  option.selected = option.value === mapId;
});
