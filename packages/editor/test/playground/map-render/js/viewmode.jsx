import '../css/viewmode.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Editor from '../../../../src/index';
import { buildDesigner, LocalStorageManager, PersistenceManager, DesignerOptionsBuilder } from '@wisemapping/mindplot';


const initialization = () => {
      const p = new LocalStorageManager('samples/{id}.wxml');
      const options = DesignerOptionsBuilder.buildOptions({ persistenceManager: p, readOnly: true, saveOnLoad: false });
      
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
      
      // Code for selector of map.
      const mapSelectElem = document.getElementById('map-select');
      mapSelectElem.addEventListener('change', (e) => {
        const selectMap = e.target.value;
        window.location = `${window.location.pathname}?id=${selectMap}`;
      });
      
      Array.from(mapSelectElem.options).forEach((option) => {
        option.selected = option.value === mapId;
      });
  };

  ReactDOM.render(
    <Editor 
      mapId={global.mapId}
      memoryPersistence={global.memoryPersistence}
      readOnlyMode={global.readOnly}
      locale={global.locale}
      onAction={(action) => console.log('action called:', action)}
      initCallback={initialization}
    />,
    document.getElementById('root'),
  );
  