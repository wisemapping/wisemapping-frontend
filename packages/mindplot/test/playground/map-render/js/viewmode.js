import '../css/embedded.less';
import { buildDesigner, loadDesignerOptions, loadExample } from './loader';
import { Mindmap, PersistenceManager } from '../../../../src';

const example = async () => {
  const mapId = 'welcome';
  // Set readonly option ...
  const options = await loadDesignerOptions();
  options.readOnly = true;
  const designer = buildDesigner(options);

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
