import React from 'react';
import ReactDOM from 'react-dom';
import Editor, { EditorOptions } from '../../../../src/index';
import { LocalStorageManager, Designer } from '@wisemapping/mindplot';

const initialization = (designer: Designer) => {

  designer.addEvent('loadSuccess', () => {
    const elem = document.getElementById('mindplot');
    if (elem) {
      elem.classList.add('ready');
    }
  });
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
    onLoad={initialization}
  />,
  document.getElementById('root'),
);
