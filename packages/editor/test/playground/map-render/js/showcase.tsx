/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React from 'react';
import Editor, { EditorOptions, useEditor } from '../../../../src/index';
import { createRoot } from 'react-dom/client';
import { LocalStorageManager, Designer } from '@wisemapping/mindplot';
import MapInfoImpl from './MapInfoImpl';

const initialization = (designer: Designer) => {
  designer.addEvent('loadSuccess', () => {
    const elem = document.getElementById('mindmap-comp');
    if (elem) {
      elem.classList.add('ready');
    }
  });
};

const persistence = new LocalStorageManager('samples/{id}.wxml', false, false);
const options: EditorOptions = {
  mode: 'showcase',
  locale: 'en',
  enableKeyboardEvents: true,
  enableAppBar: true,
};

const mapInfo = new MapInfoImpl('welcome', 'Develop Map Title', 'The Creator', false);

const Playground = () => {
  const editor = useEditor({
    mapInfo,
    options,
    persistenceManager: persistence,
  });
  return (
    <Editor
      editor={editor}
      onAction={(action) => console.log('action called:', action)}
      onLoad={initialization}
    />
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<Playground />);
