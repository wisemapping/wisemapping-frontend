/*
 *    Copyright [2015] [wisemapping]
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
import { $assert } from '@wisemapping/core-js';
import $ from 'jquery';
import { $msg } from './Messages';
import PersistenceManager from './PersistenceManager';

class RESTPersistenceManager extends PersistenceManager {
  constructor(options) {
    $assert(options.documentUrl, 'documentUrl can not be null');
    $assert(options.revertUrl, 'revertUrl can not be null');
    $assert(options.lockUrl, 'lockUrl can not be null');
    $assert(options.session, 'session can not be null');
    $assert(options.timestamp, 'timestamp can not be null');
    super();

    this.documentUrl = options.documentUrl;
    this.revertUrl = options.revertUrl;
    this.lockUrl = options.lockUrl;
    this.timestamp = options.timestamp;
    this.session = options.session;
  }

  saveMapXml(mapId, mapXml, pref, saveHistory, events, sync) {
    const data = {
      id: mapId,
      xml: mapXml,
      properties: pref,
    };

    const persistence = this;
    let query = `minor=${!saveHistory}`;
    query = `${query}&timestamp=${this.timestamp}`;
    query = `${query}&session=${this.session}`;

    if (!persistence.onSave) {
      // Mark save in process and fire a event unlocking the save ...
      persistence.onSave = true;
      persistence.clearTimeout = setTimeout(() => {
        persistence.clearTimeout = null;
        persistence.onSave = false;
      }, 10000);

      $.ajax({
        url: `${this.documentUrl.replace('{id}', mapId)}?${query}`,
        type: 'put',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        async: !sync,

        success(successData, textStatus, jqXHRresponseText) {
          persistence.timestamp = successData;
          events.onSuccess();
        },
        error(jqXHR, textStatus, errorThrown) {
          events.onError(persistence._buildError());
        },
        complete() {
          // Clear event timeout ...
          if (persistence.clearTimeout) {
            clearTimeout(persistence.clearTimeout);
          }
          persistence.onSave = false;
        },
        fail(xhr, textStatus) {
          const { responseText } = xhr;
          let userMsg = { severity: 'SEVERE', message: $msg('SAVE_COULD_NOT_BE_COMPLETED') };

          const contentType = xhr.getResponseHeader('Content-Type');
          if (contentType != null && contentType.indexOf('application/json') !== -1) {
            let serverMsg = null;
            try {
              serverMsg = $.parseJSON(responseText);
              serverMsg = serverMsg.globalSeverity ? serverMsg : null;
            } catch (e) {
              // Message could not be decoded ...
            }
            userMsg = persistence._buildError(serverMsg);
          } else if (this.status === 405) {
            userMsg = { severity: 'SEVERE', message: $msg('SESSION_EXPIRED') };
          }
          events.onError(userMsg);
          persistence.onSave = false;
        },
      });
    }
  }

  discardChanges(mapId) {
    $.ajax({
      url: this.revertUrl.replace('{id}', mapId),
      async: false,
      method: 'post',
      headers: { 'Content-Type': 'application/json; charset=utf-8', Accept: 'application/json' },
      error(xhr, ajaxOptions, thrownError) {
        console.error(`Request error => status:${xhr.status} ,thrownError: ${thrownError}`);
      },
    });
  }

  unlockMap(mindmap) {
    const mapId = mindmap.getId();
    $.ajax({
      url: this.lockUrl.replace('{id}', mapId),
      async: false,
      method: 'put',
      headers: { 'Content-Type': 'text/plain' },
      data: 'false',
      error(xhr, ajaxOptions, thrownError) {
        console.error(`Request error => status:${xhr.status} ,thrownError: ${thrownError}`);
      },
    });
  }

  _buildError(jsonSeverResponse) {
    let message = jsonSeverResponse ? jsonSeverResponse.globalErrors[0] : null;
    let severity = jsonSeverResponse ? jsonSeverResponse.globalSeverity : null;

    if (!message) {
      message = $msg('SAVE_COULD_NOT_BE_COMPLETED');
    }

    if (!severity) {
      severity = 'INFO';
    }
    return { severity, message };
  }

  loadMapDom(mapId) {
    // Let's try to open one from the local directory ...
    let xml;
    $.ajax({
      url: `${this.documentUrl.replace('{id}', mapId)}/xml`,
      method: 'get',
      async: false,
      headers: { 'Content-Type': 'text/plain', Accept: 'application/xml' },
      success(responseText) {
        xml = responseText;
      },
      error(xhr, ajaxOptions, thrownError) {
        console.error(`Request error => status:${xhr.status} ,thrownError: ${thrownError}`);
      },
    });

    // If I could not load it from a file, hard code one.
    if (xml == null) {
      throw new Error(`Map with id ${mapId} could not be loaded`);
    }

    return xml;
  }
}

export default RESTPersistenceManager;
