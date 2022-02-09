import '../css/editor.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Editor from '../../../../src/index';
import { buildDesigner, LocalStorageManager, PersistenceManager, DesignerOptionsBuilder } from '@wisemapping/mindplot';

global.accountName = 'Test User';
global.accountEmail = 'test@example.com';
global.memoryPersistence = false;
global.readOnly = false;
global.mapId = 'welcome';
global.locale = 'en';


const initialization = () => {
  const p = new LocalStorageManager('samples/{id}.wxml');
  const options = DesignerOptionsBuilder.buildOptions({ 
    persistenceManager: p
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
}

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
