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
import jquery from 'jquery';
import * as DesignerBuilder from './components/DesignerBuilder';
import Mindmap from './components/model/Mindmap';
import PersistenceManager from './components/PersistenceManager';
import Designer from './components/Designer';
import LocalStorageManager from './components/LocalStorageManager';
import RESTPersistenceManager from './components/RestPersistenceManager';
import MockPersistenceManager from './components/MockPersistenceManager';
import DesignerOptionsBuilder from './components/DesignerOptionsBuilder';
import ImageExporterFactory from './components/export/ImageExporterFactory';
import TextExporterFactory from './components/export/TextExporterFactory';
import TextImporterFactory from './components/import/TextImporterFactory';
import Exporter from './components/export/Exporter';
import Importer from './components/import/Importer';
import DesignerKeyboard from './components/DesignerKeyboard';
import EditorRenderMode from './components/EditorRenderMode';
import ImageIcon from './components/ImageIcon';

import {
  buildDesigner,
} from './components/DesignerBuilder';

import {
  $notify,
} from './components/widget/ToolbarNotifier';

import {
  $msg,
} from './components/Messages';

// This hack is required to initialize Bootstrap. In future, this should be removed.
const globalAny: any = global;
globalAny.jQuery = jquery;
require('../../../libraries/bootstrap/js/bootstrap.min');

export {
  Mindmap,
  Designer,
  DesignerBuilder,
  PersistenceManager,
  RESTPersistenceManager,
  MockPersistenceManager,
  LocalStorageManager,
  DesignerOptionsBuilder,
  buildDesigner,
  EditorRenderMode,
  TextExporterFactory,
  ImageExporterFactory,
  TextImporterFactory,
  Exporter,
  Importer,
  ImageIcon,
  $notify,
  $msg,
  DesignerKeyboard,
};
