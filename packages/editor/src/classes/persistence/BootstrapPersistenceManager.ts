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

import { PersistenceManager } from '@wisemapping/mindplot';
import type { PersistenceErrorCallback } from '@wisemapping/mindplot/src/components/PersistenceManager';

/**
 * A PersistenceManager wrapper that uses bootstrap XML instead of fetching from server.
 * The XML is mandatory when using this manager.
 */
class BootstrapPersistenceManager extends PersistenceManager {
  private wrappedManager: PersistenceManager;
  private bootstrapXML: string;

  constructor(wrappedManager: PersistenceManager, bootstrapXML: string) {
    super();
    if (!bootstrapXML) {
      throw new Error('BootstrapPersistenceManager requires bootstrapXML to be provided');
    }
    this.wrappedManager = wrappedManager;
    this.bootstrapXML = bootstrapXML;
  }

  async loadMapDom(): Promise<Document> {
    // Bootstrap XML is mandatory - use it instead of fetching from server
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.bootstrapXML, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Failed to parse bootstrap XML: ${parserError.textContent}`);
    }

    return xmlDoc;
  }

  discardChanges(mapId: string): void {
    this.wrappedManager.discardChanges(mapId);
  }

  saveMapXml(
    mapId: string,
    mapXml: Document,
    pref?: string,
    saveHistory?: boolean,
    events?: unknown,
  ): void {
    this.wrappedManager.saveMapXml(mapId, mapXml, pref, saveHistory, events);
  }

  unlockMap(mapId: string): void {
    this.wrappedManager.unlockMap(mapId);
  }

  addErrorHandler(callback: PersistenceErrorCallback): void {
    this.wrappedManager.addErrorHandler(callback);
  }

  removeErrorHandler(callback?: PersistenceErrorCallback): void {
    this.wrappedManager.removeErrorHandler(callback);
  }
}

export default BootstrapPersistenceManager;
