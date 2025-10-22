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

import './global-styled.css';
import {
  PersistenceManager,
  DesignerOptionsBuilder,
  Designer,
  DesignerKeyboard,
  Mindmap,
  MockPersistenceManager,
  LocalStorageManager,
  RESTPersistenceManager,
  TextExporterFactory,
  ImageExporterFactory,
  Exporter,
  Importer,
  TextImporterFactory,
  XMLSerializerFactory,
} from '@wisemapping/mindplot';

import Editor from './components';
import EditorLoadingSkeleton from './components/editor-loading-skeleton';
import type MapInfo from './classes/model/map-info';
import { useEditor } from './hooks/useEditor';
import type { EditorOptions } from './hooks/useEditor';
import type { PersistenceError } from '@wisemapping/mindplot/src/components/PersistenceManager';
import type SizeType from '@wisemapping/mindplot/src/components/SizeType';
import type { ThemeVariantStorage } from './types/ThemeVariantStorage';

export type { PersistenceError, EditorOptions, MapInfo, SizeType, ThemeVariantStorage };

export {
  PersistenceManager,
  DesignerOptionsBuilder,
  Designer,
  DesignerKeyboard,
  Mindmap,
  MockPersistenceManager,
  LocalStorageManager,
  RESTPersistenceManager,
  TextExporterFactory,
  ImageExporterFactory,
  Exporter,
  Importer,
  TextImporterFactory,
  XMLSerializerFactory,
  useEditor,
  EditorLoadingSkeleton,
};

export default Editor;
