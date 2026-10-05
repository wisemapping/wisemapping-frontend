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
import { $msg } from './Messages';
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

export type SaveEvents = {
  onSuccess: () => void;
  onError: (error: PersistenceError) => void;
};

export type SaveOptions = {
  // A flush (e.g. when leaving the editor): sent as soon as no other save is in flight.
  urgent?: boolean;
};

abstract class PersistenceManager {
  private static _instance: PersistenceManager | undefined;

  private _errorHandlers: PersistenceErrorCallback[] = [];

  save(
    mindmap: Mindmap,
    editorProperties: object,
    saveHistory: boolean,
    events?: SaveEvents,
    options?: SaveOptions,
  ): void {
    $assert(mindmap, 'mindmap can not be null');
    $assert(editorProperties, 'editorProperties can not be null');

    const mapId = mindmap.getId() || 'WiseMapping';
    $assert(mapId, 'mapId can not be null');

    try {
      // A map that can not be serialized is a failed save too, reported through onError ...
      const serializer = XMLSerializerFactory.createFromMindmap(mindmap);
      const domMap = serializer.toXML(mindmap);
      const pref = JSON.stringify(editorProperties);
      this.saveMapXml(mapId, domMap, pref, saveHistory, events, options);
    } catch (e) {
      console.error(e);
      events?.onError({
        severity: 'SEVERE',
        errorType: 'unexpected',
        message: $msg('SAVE_COULD_NOT_BE_COMPLETED'),
      });
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

  abstract discardChanges(mapId: string): void | Promise<void>;

  abstract loadMapDom(mapId: string): Promise<Document>;

  abstract saveMapXml(
    mapId: string,
    mapXml: Document,
    pref?: string,
    saveHistory?: boolean,
    events?: SaveEvents,
    options?: SaveOptions,
  ): void;

  abstract unlockMap(mapId: string): void | Promise<void>;

  static init = (instance: PersistenceManager) => {
    this._instance = instance;
  };

  static getInstance(): PersistenceManager | undefined {
    return this._instance;
  }

  /** Drops the static instance, if it is still the given one. */
  static clear(instance: PersistenceManager): void {
    if (this._instance === instance) {
      this._instance = undefined;
    }
  }

  static loadFromDom(mapId: string, mapDom: Document) {
    $assert(mapId, 'mapId can not be null');
    $assert(mapDom, 'mapDom can not be null');

    const serializer = XMLSerializerFactory.createFromDocument(mapDom);
    return serializer.loadFromDom(mapDom, mapId);
  }
}

export default PersistenceManager;
