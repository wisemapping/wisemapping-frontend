/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import '../css/viewmode.css';
import React from 'react';
import { LocalStorageManager, Designer } from '@wisemapping/mindplot';
import MapInfoImpl from './MapInfoImpl';
import { createRoot } from 'react-dom/client';
import Editor, { EditorOptions, useEditor } from '../../../../src';
import { createMockThemeVariantStorage } from './MockThemeVariantStorage';

const initialization = (designer: Designer) => {
  designer.addEvent('loadSuccess', () => {
    const elem = document.getElementById('mindmap-comp');
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
};

// Obtain map id from query param
const params = new URLSearchParams(window.location.search.substring(1));
const mapId = params.get('id') || 'welcome';
const persistence = new LocalStorageManager('samples/{id}.wxml', false, undefined);
const options: EditorOptions = {
  mode: 'viewonly-private',
  locale: 'en',
  enableKeyboardEvents: true,
  enableAppBar: false,
};

const mapInfo = new MapInfoImpl(mapId, 'Develop Map Title', 'Paulo Veiga', false);
const themeVariantStorage = createMockThemeVariantStorage();

const Playground = () => {
  const editor = useEditor({
    mapInfo,
    options,
    persistenceManager: persistence,
  });
  return (
    <Editor
      config={editor}
      onAction={(action) => console.log('action called:', action)}
      onLoad={initialization}
      themeVariantStorage={themeVariantStorage}
    />
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<Playground />);
