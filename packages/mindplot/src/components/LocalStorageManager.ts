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
import PersistenceManager from './PersistenceManager';

class LocalStorageManager extends PersistenceManager {
  private documentUrl: string;

  private forceLoad: boolean;

  private readOnly: boolean;

  constructor(documentUrl: string, forceLoad: boolean, readOnly = true) {
    super();
    this.documentUrl = documentUrl;
    this.forceLoad = forceLoad;
    this.readOnly = readOnly;
  }

  saveMapXml(mapId: string, mapDoc: Document, _pref: string, _saveHistory: boolean, events): void {
    const mapXml = new XMLSerializer().serializeToString(mapDoc);
    if (!this.readOnly) {
      localStorage.setItem(`${mapId}-xml`, mapXml);
      events.onSuccess();
    }
    console.log(`Map XML to save => ${mapXml}`);
  }

  discardChanges(mapId: string) {
    if (!this.readOnly) {
      localStorage.removeItem(`${mapId}-xml`);
    }
  }

  private buildHeader() {
    // const csrfToken = this.getCSRFToken();
    const result = {
      'Content-Type': 'text/plain',
      Accept: 'application/xml',
    };
    // if (csrfToken) {
    //   result['X-CSRF-Token'] = csrfToken;
    // }
    return result;
  }

  loadMapDom(mapId: string): Promise<Document> {
    let result: Promise<Document>;
    let localStorate: string | null = null;
    if (!this.readOnly) {
      localStorate = localStorage.getItem(`${mapId}-xml`);
    }

    if (localStorate == null || this.forceLoad) {
      const url = this.documentUrl.replace('{id}', mapId);

      result = fetch(url, {
        method: 'get',
        headers: this.buildHeader(),
      })
        .then((response: Response) => {
          if (!response.ok) {
            console.error(`load error: ${response.status}`);
            throw new Error(`load error: ${response.status}, ${response.statusText}`);
          }
          return response.text();
        })
        .then((xmlStr) => new DOMParser().parseFromString(xmlStr, 'text/xml'));
    } else {
      const doc = new DOMParser().parseFromString(localStorate, 'text/xml');
      result = Promise.resolve(doc);
    }
    return result;
  }

  unlockMap(): void {
    // Ignore, no implementation required ...
  }
}

export default LocalStorageManager;
