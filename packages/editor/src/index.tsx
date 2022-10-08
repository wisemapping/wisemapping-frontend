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
