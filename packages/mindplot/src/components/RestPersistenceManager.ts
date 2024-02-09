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
import { $assert } from '@wisemapping/core-js';
import { $msg } from './Messages';
import PersistenceManager, { PersistenceError } from './PersistenceManager';

class RESTPersistenceManager extends PersistenceManager {
  private documentUrl: string;

  private revertUrl: string;

  private lockUrl: string;

  private jwt: string | undefined;

  private clearTimeout;

  private onSave: boolean;

  constructor(options: { documentUrl: string; revertUrl: string; lockUrl: string; jwt?: string }) {
    $assert(options.documentUrl, 'documentUrl can not be null');
    $assert(options.revertUrl, 'revertUrl can not be null');
    $assert(options.lockUrl, 'lockUrl can not be null');
    super();

    this.documentUrl = options.documentUrl;
    this.revertUrl = options.revertUrl;
    this.lockUrl = options.lockUrl;
    this.onSave = false;
    this.jwt = options.jwt;
  }

  saveMapXml(mapId: string, mapXml: Document, pref: string, saveHistory: boolean, events): void {
    const data = {
      id: mapId,
      xml: new XMLSerializer().serializeToString(mapXml),
      properties: pref,
    };

    const query = `minor=${!saveHistory}`;

    if (!this.onSave) {
      // Mark save in process and fire a event unlocking the save ...
      this.onSave = true;
      this.clearTimeout = setTimeout(() => {
        this.clearTimeout = null;
        this.onSave = false;
      }, 10000);

      const persistence = this;

      const headers = this._buildHttpHeader('application/json; charset=utf-8', 'application/json');

      fetch(`${this.documentUrl.replace('{id}', mapId)}?${query}`, {
        method: 'PUT',
        // Blob helps to resuce the memory on large payload.
        body: new Blob([JSON.stringify(data)], { type: 'text/plain' }),
        headers,
      })
        .then(async (response: Response) => {
          if (response.ok) {
            events.onSuccess();
          } else {
            console.error(`Saving error: ${response.status}`);
            let userMsg: PersistenceError | null = null;
            if (response.status === 405) {
              userMsg = {
                severity: 'SEVERE',
                message: $msg('SESSION_EXPIRED'),
                errorType: 'session-expired',
              };
            } else {
              const responseText = await response.text();
              const contentType = response.headers['Content-Type'];
              if (contentType != null && contentType.indexOf('application/json') !== -1) {
                let serverMsg: null | { globalSeverity: string } = null;
                try {
                  serverMsg = JSON.parse(responseText);
                  serverMsg = serverMsg && serverMsg.globalSeverity ? serverMsg : null;
                } catch (e) {
                  // Message could not be decoded ...
                }
                userMsg = persistence._buildError(serverMsg);
              }
            }
            if (userMsg) {
              this.triggerError(userMsg);
              events.onError(userMsg);
            }
          }

          // Clear event timeout ...
          if (persistence.clearTimeout) {
            clearTimeout(persistence.clearTimeout);
          }
          persistence.onSave = false;
        })
        .catch(() => {
          const userMsg: PersistenceError = {
            severity: 'SEVERE',
            message: $msg('SAVE_COULD_NOT_BE_COMPLETED'),
            errorType: 'generic',
          };
          this.triggerError(userMsg);
          events.onError(userMsg);

          // Clear event timeout ...
          if (persistence.clearTimeout) {
            clearTimeout(persistence.clearTimeout);
          }
          persistence.onSave = false;
        });
    }
  }

  discardChanges(mapId: string): void {
    const headers = this._buildHttpHeader('application/json; charset=utf-8');
    fetch(this.revertUrl.replace('{id}', mapId), {
      method: 'POST',
      headers,
    });
  }

  unlockMap(mapId: string): void {
    const headers = this._buildHttpHeader('text/plain; charset=utf-8');
    fetch(this.lockUrl.replace('{id}', mapId), {
      method: 'PUT',
      headers,
      body: 'false',
    });
  }

  private _buildError(jsonSeverResponse) {
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

  loadMapDom(mapId: string): Promise<Document> {
    const url = `${this.documentUrl.replace('{id}', mapId)}/xml`;
    const headers = this._buildHttpHeader('text/plain; charset=utf-8', 'application/xml');

    return fetch(url, {
      method: 'get',
      headers,
    })
      .then((response: Response) => {
        if (!response.ok) {
          console.error(`load error: ${response.status}`);
          throw new Error(`load error: ${response.status}, ${response.statusText}`);
        }
        return response.text();
      })
      .then((xmlStr) => new DOMParser().parseFromString(xmlStr, 'text/xml'));
  }

  private _buildHttpHeader(contentType: string, accept?: string) {
    const headers = {
      'Content-Type': contentType,
    };

    if (accept) {
      // eslint-disable-next-line dot-notation
      headers['Accept'] = accept;
    }

    if (this.jwt) {
      // eslint-disable-next-line dot-notation
      headers['Authorization'] = `Bearer ${this.jwt} `;
    }

    const crfs = this.getCSRFToken();
    if (crfs) {
      headers['X-CSRF-Token'] = crfs;
    }
    return headers;
  }
}

export default RESTPersistenceManager;
