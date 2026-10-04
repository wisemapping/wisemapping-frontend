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
import { AjaxUtils } from './util/AjaxUtils';
import PersistenceManager, { PersistenceError, ServerError } from './PersistenceManager';

type SaveEvents = {
  onSuccess: () => void;
  onError: (error: PersistenceError) => void;
};

type PendingSave = {
  mapId: string;
  data: { id: string; xml: string; properties: string };
  saveHistory: boolean;
  events: SaveEvents[];
};

class RESTPersistenceManager extends PersistenceManager {
  private documentUrl: string;

  private revertUrl: string;

  private lockUrl: string;

  private jwt: string | undefined;

  constructor(options: { documentUrl: string; revertUrl: string; lockUrl: string; jwt?: string }) {
    $assert(options.documentUrl, 'documentUrl can not be null');
    $assert(options.revertUrl, 'revertUrl can not be null');
    $assert(options.lockUrl, 'lockUrl can not be null');
    super();

    this.documentUrl = options.documentUrl;
    this.revertUrl = options.revertUrl;
    this.lockUrl = options.lockUrl;
    this.jwt = options.jwt;
  }

  private _handleError(error: PersistenceError, events: SaveEvents[]): void {
    this.triggerError(error);
    events.forEach((e) => e.onError(error));
  }

  // Server writes are rate limited: one request in flight and at most one request every
  // MIN_SAVE_INTERVAL_MS. Saves requested in between are coalesced per map into a single
  // pending save of the latest payload; every caller is notified when that save completes.
  private static readonly MIN_SAVE_INTERVAL_MS = 10000;

  private _saveInFlight = false;

  private _lastSaveStartedAt: number | undefined;

  private _saveTimer: ReturnType<typeof setTimeout> | undefined;

  private _pendingSaves = new Map<string, PendingSave>();

  private _scheduleNextSave(): void {
    if (this._saveInFlight || this._saveTimer || this._pendingSaves.size === 0) {
      return;
    }

    const wait =
      this._lastSaveStartedAt === undefined
        ? 0
        : this._lastSaveStartedAt + RESTPersistenceManager.MIN_SAVE_INTERVAL_MS - Date.now();
    if (wait > 0) {
      this._saveTimer = setTimeout(() => {
        this._saveTimer = undefined;
        this._scheduleNextSave();
      }, wait);
      return;
    }

    const [mapId, pending] = this._pendingSaves.entries().next().value as [string, PendingSave];
    this._pendingSaves.delete(mapId);
    this._sendSave(pending);
  }

  private _sendSave(pending: PendingSave): void {
    this._saveInFlight = true;
    this._lastSaveStartedAt = Date.now();

    const { mapId, data, saveHistory, events } = pending;
    const query = `minor=${!saveHistory}`;
    const headers = this._buildHttpHeader('application/json; charset=utf-8', 'application/json');
    fetch(`${this.documentUrl.replace('{id}', mapId)}?${query}`, {
      method: 'PUT',
      // Blob helps to reduce the memory on large payload.
      body: new Blob([JSON.stringify(data)], { type: 'text/plain' }),
      headers,
    })
      .then(async (response: Response): Promise<PersistenceError | undefined> => {
        if (response.ok) {
          return undefined;
        }
        switch (response.status) {
          case 401:
          case 403:
            console.warn(`Saving error: ${response.status} - session expired`);
            return {
              severity: 'FATAL',
              errorType: 'auth',
              message: $msg('SESSION_EXPIRED'),
            };
          default: {
            console.error(`Saving error: ${response.status}`);
            return this._buildError(response);
          }
        }
      })
      .catch((): PersistenceError => ({
        severity: 'SEVERE',
        errorType: 'unexpected',
        message: $msg('SAVE_COULD_NOT_BE_COMPLETED'),
      }))
      .then((error) => {
        this._saveInFlight = false;
        try {
          if (error) {
            this._handleError(error, events);
          } else {
            events.forEach((e) => e.onSuccess());
          }
        } finally {
          this._scheduleNextSave();
        }
      });
  }

  saveMapXml(
    mapId: string,
    mapXml: Document,
    pref: string,
    saveHistory: boolean,
    events?: SaveEvents,
  ): void {
    const data = {
      id: mapId,
      xml: new XMLSerializer().serializeToString(mapXml),
      properties: pref,
    };

    const pending = this._pendingSaves.get(mapId);
    if (pending) {
      pending.data = data;
      pending.saveHistory = pending.saveHistory || saveHistory;
      if (events) {
        pending.events.push(events);
      }
    } else {
      this._pendingSaves.set(mapId, {
        mapId,
        data,
        saveHistory,
        events: events ? [events] : [],
      });
    }
    this._scheduleNextSave();
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
    const contentType = response.headers.get('Content-Type');

    let serverError: ServerError | undefined;
    if (contentType?.includes('application/json')) {
      try {
        serverError = JSON.parse(responseText);
      } catch {
        serverError = undefined;
      }
    }

    // This is a wise client server error ...
    if (serverError) {
      result = {
        severity: serverError.globalSeverity,
        errorType: 'expected',
        message: serverError.globalErrors?.[0] ?? $msg('SAVE_COULD_NOT_BE_COMPLETED'),
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
      .then((xmlStr) => AjaxUtils.parseXML(xmlStr));
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
