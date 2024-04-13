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
import type EditorRenderMode from './components/EditorRenderMode';
import DesignerModel from './components/DesignerModel';

import SvgImageIcon from './components/SvgImageIcon';

import MindplotWebComponent from './components/MindplotWebComponent';
import type MindplotWebComponentInterface from './components/MindplotWebComponentInterface';
import LinkIcon from './components/LinkIcon';
import NoteIcon from './components/NoteIcon';
import Topic from './components/Topic';

import LinkModel from './components/model/LinkModel';
import NoteModel from './components/model/NoteModel';
import WidgetBuilder, { WidgetEventType } from './components/WidgetBuilder';
import { buildDesigner } from './components/DesignerBuilder';
import { $notify } from './components/model/ToolbarNotifier';
import XMLSerializerFactory from './components/persistence/XMLSerializerFactory';

declare global {
  // Todo: There are some global references that needs to be removed inside mindplot.
  // eslint-disable-next-line vars-on-top, no-var
  var designer: Designer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = global;
globalAny.jQuery = jquery;
// WebComponent registration
// The if statement is the fix for doble registration problem. Can be deleted wen webapp-mindplot dependency be dead.
if (!customElements.get('mindplot-component')) {
  customElements.define('mindplot-component', MindplotWebComponent);
}

export {
  Mindmap,
  Designer,
  DesignerModel,
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
  SvgImageIcon,
  Importer,
  $notify,
  DesignerKeyboard,
  MindplotWebComponent,
  MindplotWebComponentInterface,
  LinkIcon,
  LinkModel,
  NoteIcon,
  NoteModel,
  WidgetBuilder,
  WidgetEventType,
  Topic,
  XMLSerializerFactory,
};
