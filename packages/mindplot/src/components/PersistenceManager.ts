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
import { $assert } from './util/assert';
import { Mindmap } from '..';
import XMLSerializerFactory from './persistence/XMLSerializerFactory';

export type PersistenceError = {
  errorType: 'auth' | 'expected' | 'unexpected';
  severity: 'INFO' | 'WARNING' | 'SEVERE' | 'FATAL';
  message: string;
};

export type ServerError = {
  globalSeverity: 'INFO' | 'WARNING' | 'SEVERE' | 'FATAL';
  globalErrors: string[];
};

export type PersistenceErrorCallback = (error: PersistenceError) => void;

abstract class PersistenceManager {
  private static _instance: PersistenceManager;

  private _errorHandlers: PersistenceErrorCallback[] = [];

  save(mindmap: Mindmap, editorProperties, saveHistory: boolean, events?) {
    $assert(mindmap, 'mindmap can not be null');
    $assert(editorProperties, 'editorProperties can not be null');

    const mapId = mindmap.getId() || 'WiseMapping';
    $assert(mapId, 'mapId can not be null');

    const serializer = XMLSerializerFactory.createFromMindmap(mindmap);
    const domMap = serializer.toXML(mindmap);
    const pref = JSON.stringify(editorProperties);
    try {
      this.saveMapXml(mapId, domMap, pref, saveHistory, events);
    } catch (e) {
      console.error(e);
      events.onError(e);
    }
  }

  async load(mapId: string): Promise<Mindmap> {
    $assert(mapId, 'mapId can not be null');

    const document = await this.loadMapDom(mapId);
    return PersistenceManager.loadFromDom(mapId, document);
  }

  triggerError(error: PersistenceError) {
    this._errorHandlers.forEach((handler) => handler(error));
  }

  addErrorHandler(callback: PersistenceErrorCallback) {
    this._errorHandlers.push(callback);
  }

  removeErrorHandler(callback?: PersistenceErrorCallback): void {
    if (!callback) {
      this._errorHandlers.length = 0;
    }
    const index = this._errorHandlers.findIndex((handler) => handler === callback);
    if (index !== -1) {
      this._errorHandlers.splice(index, 1);
    }
  }

  abstract discardChanges(mapId: string): void;

  abstract loadMapDom(mapId: string): Promise<Document>;

  abstract saveMapXml(mapId: string, mapXml: Document, pref?, saveHistory?: boolean, events?);

  abstract unlockMap(mapId: string): void;

  static init = (instance: PersistenceManager) => {
    this._instance = instance;
  };

  static getInstance(): PersistenceManager {
    return this._instance;
  }

  static loadFromDom(mapId: string, mapDom: Document) {
    $assert(mapId, 'mapId can not be null');
    $assert(mapDom, 'mapDom can not be null');

    const serializer = XMLSerializerFactory.createFromDocument(mapDom);
    return serializer.loadFromDom(mapDom, mapId);
  }
}

export default PersistenceManager;
