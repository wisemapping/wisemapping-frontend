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
import LocalStorageManager from '../../../src/components/LocalStorageManager';
import MockPersistenceManager from '../../../src/components/MockPersistenceManager';
import PersistenceManager from '../../../src/components/PersistenceManager';
import type Mindmap from '../../../src/components/model/Mindmap';

const MAP_XML = '<map version="tango"><topic central="true" text="Central" id="1"/></map>';
const BROKEN_XML = '<html><body>Bad <b>gateway</body></html>';

const buildDoc = (): Document => new DOMParser().parseFromString(MAP_XML, 'text/xml');

const buildEvents = () => ({ onSuccess: jest.fn(), onError: jest.fn() });

describe('LocalStorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('settles the save of a read-only manager (B-SETTLE)', () => {
    const manager = new LocalStorageManager('/maps/{id}', false, undefined, true);
    const events = buildEvents();

    manager.saveMapXml('1', buildDoc(), '{}', false, events);

    expect(events.onSuccess).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('1-xml')).toBeNull();
  });

  it('stores the map and settles the save of a writable manager', () => {
    const manager = new LocalStorageManager('/maps/{id}', false, undefined, false);
    const events = buildEvents();

    manager.saveMapXml('1', buildDoc(), '{}', false, events);

    expect(events.onSuccess).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('1-xml')).toContain('Central');
  });

  it('does not log the whole map on save (B-SETTLE)', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const manager = new LocalStorageManager('/maps/{id}', false, undefined, false);

    manager.saveMapXml('1', buildDoc(), '{}', false, buildEvents());

    expect(log).not.toHaveBeenCalled();
  });

  it('rejects a map stored in local storage that is not well-formed XML (D8)', async () => {
    localStorage.setItem('1-xml', BROKEN_XML);
    const manager = new LocalStorageManager('/maps/{id}', false, undefined, false);

    await expect(manager.loadMapDom('1')).rejects.toThrow(/XML/);
  });

  it('rejects a fetched map that is not well-formed XML (D8)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve(BROKEN_XML),
    }) as unknown as typeof fetch;
    const manager = new LocalStorageManager('/maps/{id}', true, undefined, true);

    await expect(manager.loadMapDom('1')).rejects.toThrow(/XML/);
  });

  it('loads a well-formed fetched map', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve(MAP_XML),
    }) as unknown as typeof fetch;
    const manager = new LocalStorageManager('/maps/{id}', true, undefined, true);

    const doc = await manager.loadMapDom('1');
    expect(doc.documentElement.nodeName).toBe('map');
  });
});

describe('MockPersistenceManager', () => {
  it('settles the save (B-SETTLE)', () => {
    const manager: PersistenceManager = new MockPersistenceManager(MAP_XML);
    const events = buildEvents();

    manager.saveMapXml('1', buildDoc(), '{}', false, events);

    expect(events.onSuccess).toHaveBeenCalledTimes(1);
  });

  it('accepts a save without events', () => {
    const manager: PersistenceManager = new MockPersistenceManager(MAP_XML);
    expect(() => manager.saveMapXml('1', buildDoc(), '{}', false)).not.toThrow();
  });
});

describe('PersistenceManager.save', () => {
  class FailingManager extends PersistenceManager {
    saveMapXml(): void {
      throw new Error('storage full');
    }

    discardChanges(): void {
      // Not used.
    }

    loadMapDom(): Promise<Document> {
      return Promise.resolve(buildDoc());
    }

    unlockMap(): void {
      // Not used.
    }
  }

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not crash when the save fails and no events were given (B-SETTLE)', () => {
    const mindmap = PersistenceManager.loadFromDom('1', buildDoc()) as Mindmap;
    const manager = new FailingManager();

    expect(() => manager.save(mindmap, {}, false)).not.toThrow();
  });

  it('reports a failed save through events.onError', () => {
    const mindmap = PersistenceManager.loadFromDom('1', buildDoc()) as Mindmap;
    const manager = new FailingManager();
    const events = buildEvents();

    manager.save(mindmap, {}, false, events);

    expect(events.onError).toHaveBeenCalledTimes(1);
  });
});
