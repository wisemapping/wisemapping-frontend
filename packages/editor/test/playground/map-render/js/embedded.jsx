import '../css/embedded.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Editor from '../../../../src/index';
import { buildDesigner, LocalStorageManager, PersistenceManager, DesignerOptionsBuilder } from '@wisemapping/mindplot';


const initialization = () => {
    // Options has been defined in by a external file ?
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
    document.getElementById('root')
);
