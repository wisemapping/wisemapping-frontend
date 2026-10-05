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
import ImportError from './components/import/ImportError';
import DesignerKeyboard from './components/DesignerKeyboard';
import isMacPlatform from './components/util/platform';
import type EditorRenderMode from './components/EditorRenderMode';
import DesignerModel from './components/DesignerModel';

import SvgImageIcon from './components/SvgImageIcon';

import MindplotWebComponent from './components/MindplotWebComponent';
import type MindplotWebComponentInterface from './components/MindplotWebComponentInterface';
import LayoutEventBus from './components/layout/LayoutEventBus';
import LinkIcon from './components/LinkIcon';
import NoteIcon from './components/NoteIcon';
import Topic from './components/Topic';
import HTMLTopicSelected from './components/HTMLTopicSelected';

import LinkModel from './components/model/LinkModel';
import NoteModel from './components/model/NoteModel';
import WidgetBuilder, { type WidgetEventType } from './components/WidgetBuilder';
import { buildDesigner } from './components/DesignerBuilder';
import { $notify } from './components/model/ToolbarNotifier';
import XMLSerializerFactory from './components/persistence/XMLSerializerFactory';
import type { CanvasStyleType, BackgroundPatternType } from './components/model/CanvasStyleType';

// jQuery has been removed - no longer needed
// WebComponent registration
// The if statement is the fix for doble registration problem. Can be deleted wen webapp-mindplot dependency be dead.
if (!customElements.get('mindplot-component')) {
  customElements.define('mindplot-component', MindplotWebComponent);
}

export type {
  EditorRenderMode,
  MindplotWebComponentInterface,
  WidgetEventType,
  CanvasStyleType,
  BackgroundPatternType,
};

export type { default as LayoutEventBusType, LayoutEvents } from './components/LayoutEventBusType';
export type { DesignerEvents, FeatureEditEvent } from './components/Designer';
export type { ModelUpdateEvent } from './components/DesignerUndoManager';
export type { LayoutType, OrientationType } from './components/layout/LayoutType';
export type { FontStyleType } from './components/FontStyleType';
export type { FontWeightType } from './components/FontWeightType';

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
  TextExporterFactory,
  ImageExporterFactory,
  TextImporterFactory,
  Exporter,
  SvgImageIcon,
  Importer,
  ImportError,
  $notify,
  DesignerKeyboard,
  isMacPlatform,
  LayoutEventBus,
  MindplotWebComponent,
  LinkIcon,
  LinkModel,
  NoteIcon,
  NoteModel,
  WidgetBuilder,
  Topic,
  HTMLTopicSelected,
  XMLSerializerFactory,
};

export type { TopicShapeType } from './components/model/INodeModel';
export { StrokeStyle } from './components/model/RelationshipModel';
export { LineType } from './components/ConnectionLine';
export { ContentType } from './components/ContentType';
export { default as INodeModel } from './components/model/INodeModel';
export { default as SvgIconModel } from './components/model/SvgIconModel';
export { GALLERY_ICON_NAMES } from './components/GalleryIconData';
export { default as Relationship } from './components/Relationship';
export type { default as ThemeType } from './components/model/ThemeType';
export type { ThemeVariant } from './components/theme/Theme';
export type {
  PersistenceError,
  PersistenceErrorCallback,
  SaveEvents,
  SaveOptions,
} from './components/PersistenceManager';
export type { default as SizeType } from './components/SizeType';
export type { ViewportInsets, ZoomToFitOptions } from './components/Designer';
