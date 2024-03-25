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
import PersistenceManager, { PersistenceError, ServerError } from './PersistenceManager';

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

  private _handleError(error: PersistenceError, events): void {
    this.triggerError(error);
    events.onError(error);

    // Clear event timeout ...
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
    }
    this.onSave = false;
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

            let error: PersistenceError;
            switch (response.status) {
              case 401:
              case 403:
                error = {
                  severity: 'FATAL',
                  errorType: 'auth',
                  message: $msg('SESSION_EXPIRED'),
                };
                break;
              default: {
                error = await this._buildError(response);
              }
            }
            this._handleError(error, events);
          }
        })
        .catch(() => {
          const error: PersistenceError = {
            severity: 'SEVERE',
            errorType: 'unexpected',
            message: $msg('SAVE_COULD_NOT_BE_COMPLETED'),
          };
          this._handleError(error, events);
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

  private async _buildError(response: Response): Promise<PersistenceError> {
    let result: PersistenceError;
    const responseText = await response.text();
    const contentType = response.headers['Content-Type'];

    // This is a wise client server error ...
    if (contentType?.indexOf('application/json') !== -1) {
      const serverError: ServerError = JSON.parse(responseText);
      result = {
        severity: serverError.globalSeverity,
        errorType: 'expected',
        message: serverError.globalErrors[0],
      };
    } else {
      // Unexpected error from the server ...
      result = {
        severity: 'FATAL',
        errorType: 'expected',
        message: $msg('SAVE_COULD_NOT_BE_COMPLETED'),
      };
    }
    return result;
  }

  loadMapDom(mapId: string): Promise<Document> {
    const url = `${this.documentUrl.replace('{id}', mapId)}/xml`;
    const headers = this._buildHttpHeader('text/plain; charset=utf-8', 'application/xml');

    return fetch(url, {
      method: 'GET',
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
    return headers;
  }
}

export default RESTPersistenceManager;
