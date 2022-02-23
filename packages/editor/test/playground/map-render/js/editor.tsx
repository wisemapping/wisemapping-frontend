import React from 'react';
import ReactDOM from 'react-dom';
import Editor, { EditorOptions } from '../../../../src/index';
import { buildDesigner, LocalStorageManager, PersistenceManager, DesignerOptionsBuilder } from '@wisemapping/mindplot';

const initialization = (mapId: string, options: EditorOptions, persistenceManager: PersistenceManager) => {

  const designerOptions = DesignerOptionsBuilder.buildOptions({
    persistenceManager: persistenceManager,
    zoom: options.zoom ? options.zoom : 0.8,
    mode: options.mode,
    container: 'mindplot'
  });

  const designer = buildDesigner(designerOptions);
  designer.addEvent('loadSuccess', () => {
    const elem = document.getElementById('mindplot');
    if (elem) {
      elem.classList.add('ready');
    }
  });

  // Load map from XML file persisted on disk...
  const persistence = PersistenceManager.getInstance();
  const mindmap = persistence.load(mapId);
  designer.loadMap(mindmap);
};

const persistence = new LocalStorageManager('samples/{id}.wxml', false);
const mapId = 'welcome';
const options: EditorOptions = {
  zoom: 0.8,
  locked: false,
  mapTitle: "Develop Mindnap",
  mode: 'edition',
  locale: 'en',
  enableKeyboardEvents: true
};

ReactDOM.render(
  <Editor
    mapId={mapId}
    options={options}
    persistenceManager={persistence}
    onAction={(action) => console.log('action called:', action)}
    initCallback={initialization}
  />,
  document.getElementById('root'),
);
