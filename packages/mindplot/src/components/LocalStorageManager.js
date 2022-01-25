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
import $ from 'jquery';
import PersistenceManager from './PersistenceManager';

class LocalStorageManager extends PersistenceManager {
  constructor(documentUrl, forceLoad) {
    super();
    this.documentUrl = documentUrl;
    this.forceLoad = forceLoad;
  }

  saveMapXml(mapId, mapXml, pref, saveHistory, events) {
    localStorage.setItem(`${mapId}-xml`, mapXml);
  }

  discardChanges(mapId) {
    localStorage.removeItem(`${mapId}-xml`);
  }

  loadMapDom(mapId) {
    let xml = localStorage.getItem(`${mapId}-xml`);
    if (xml == null || this.forceLoad) {
      $.ajax({
        url: this.documentUrl.replace('{id}', mapId),
        headers: { 'Content-Type': 'text/plain', Accept: 'application/xml' },
        type: 'get',
        dataType: 'text',
        async: false,
        success(response) {
          xml = response;
        },
        error(xhr, ajaxOptions, thrownError) {
          console.error(`Request error => status:${xhr.status} ,thrownError: ${thrownError}`);
        },
      });
      // If I could not load it from a file, hard code one.
      if (xml == null) {
        throw new Error(`Map could not be loaded with id:${mapId}`);
      }
    }

    return $.parseXML(xml);
  }

  unlockMap(mindmap) {
    // Ignore, no implementation required ...
  }
}

export default LocalStorageManager;
