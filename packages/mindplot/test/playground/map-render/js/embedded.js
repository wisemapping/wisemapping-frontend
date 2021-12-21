import '../css/embedded.less';
import { buildDesigner, loadDesignerOptions, loadExample } from './loader';
import { Mindmap, PersistenceManager } from '../../../../src';

const example = async () => {
  const mapId = 'welcome';
  // Options has been defined in by a external ile ?
  const queryString = window.location.search;
  const confUrl = queryString.replace('?confUrl=', '');
  const options = await loadDesignerOptions(confUrl);
  const designer = buildDesigner(options);

  designer.addEvent('loadSuccess', () => {
    document.getElementById('mindplot').classList.add('ready');
  });
  // Load map from XML file persisted on disk...
  const persistence = PersistenceManager.getInstance();
  let mindmap;
  try {
    mindmap = persistence.load(mapId);
  } catch (e) {
    console.error('The map could not be loaded, loading an empty map instead.', e);
    mindmap = Mindmap.buildEmpty(mapId);
  }
  designer.loadMap(mindmap);
};

loadExample(example);
