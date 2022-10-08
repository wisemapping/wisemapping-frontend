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

import {
  PersistenceManager,
  DesignerOptionsBuilder,
  Designer,
  DesignerKeyboard,
  EditorRenderMode,
  MindplotWebComponentInterface,
  Mindmap,
  MockPersistenceManager,
  LocalStorageManager,
  RESTPersistenceManager,
  TextExporterFactory,
  ImageExporterFactory,
  Exporter,
  Importer,
  TextImporterFactory,
} from '@wisemapping/mindplot';
import './global-styled.css';
import { ToolbarActionType } from './components/toolbar';
import { Theme } from '@mui/material/styles';
import Editor from './components';

declare global {
  // used in mindplot
  var designer: Designer;
  var accountEmail: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['mindplot-component']: MindplotWebComponentInterface;
    }
  }
}

export type EditorOptions = {
  mode: EditorRenderMode;
  locale: string;
  zoom?: number;
  locked?: boolean;
  lockedMsg?: string;
  mapTitle: string;
  enableKeyboardEvents: boolean;
};

export {
  PersistenceManager,
  DesignerOptionsBuilder,
  Designer,
  DesignerKeyboard,
  EditorRenderMode,
  Mindmap,
  MockPersistenceManager,
  LocalStorageManager,
  RESTPersistenceManager,
  TextExporterFactory,
  ImageExporterFactory,
  Exporter,
  Importer,
  TextImporterFactory,
};

export type EditorProps = {
  mapId: string;
  options: EditorOptions;
  persistenceManager: PersistenceManager;
  onAction: (action: ToolbarActionType) => void;
  onLoad?: (designer: Designer) => void;
  theme?: Theme;
  accountConfiguration?: React.ReactElement;
};

export default Editor;
