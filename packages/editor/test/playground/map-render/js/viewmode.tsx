import '../css/viewmode.css';
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

    // Code for selector of map.
    const mapSelectElem = document.getElementById('map-select') as HTMLSelectElement;
    if (mapSelectElem) {
      mapSelectElem.addEventListener('change', (e) => {
        // @ts-ignore
        const selectMap = e.target?.value;
        window.location.href = `${window.location.pathname}?id=${selectMap}`;
      });

      Array.from(mapSelectElem.options).forEach((option) => {
        option.selected = option.value === mapId;
      });
    }

  });

  // Load map from XML file persisted on disk...
  const persistence = PersistenceManager.getInstance();
  const mindmap = persistence.load(mapId);
  designer.loadMap(mindmap);
};

// Obtain map id from query param
const params = new URLSearchParams(window.location.search.substring(1));
const mapId = params.get('id') || 'welcome';
const persistence = new LocalStorageManager('samples/{id}.wxml', false);
const options: EditorOptions = {
  zoom: 0.8,
  locked: false,
  mapTitle: "Develop Mindnap",
  mode: 'viewonly',
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
