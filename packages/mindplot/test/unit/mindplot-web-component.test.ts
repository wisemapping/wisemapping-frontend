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
import Designer from '../../src/components/Designer';
import MindplotWebComponent from '../../src/components/MindplotWebComponent';
import PersistenceManager from '../../src/components/PersistenceManager';
import WidgetBuilder from '../../src/components/WidgetBuilder';
import buildDesigner from '../../src/components/DesignerBuilder';
import { DesignerOptions } from '../../src/components/DesignerOptionsBuilder';
import LocalStorageManager from '../../src/components/LocalStorageManager';

jest.mock('../../src/components/DesignerBuilder', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../src/components/DesignerKeyboard', () => ({
  __esModule: true,
  default: { getInstance: jest.fn().mockReturnValue(undefined) },
}));

jest.mock('../../src/components/model/ToolbarNotifier', () => ({
  $notify: jest.fn(),
}));

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

type SaveEvents = { onSuccess: () => void; onError: (error: unknown) => void };

// Evaluates the mode with the Designer's own read-only rule.
const isReadOnly = (options: DesignerOptions): boolean =>
  Designer.prototype.isReadOnly.call({ _options: options });

if (!customElements.get('mindplot-test-component')) {
  customElements.define('mindplot-test-component', MindplotWebComponent);
}

describe('MindplotWebComponent', () => {
  let component: MindplotWebComponent;
  let handlers: Record<string, Array<() => void>>;
  let mindmap: { getId: () => string } | null;
  let persistence: { save: jest.Mock; unlockMap: jest.Mock };
  let dispose: jest.Mock;

  const fire = (type: string): void => {
    (handlers[type] || []).forEach((h) => h());
  };

  const build = (mode?: string): DesignerOptions => {
    if (mode) {
      component.setAttribute('mode', mode);
    }
    component.buildDesigner(
      persistence as unknown as PersistenceManager,
      {} as unknown as WidgetBuilder,
    );
    const { calls } = (buildDesigner as jest.Mock).mock;
    return calls[calls.length - 1][0];
  };

  beforeEach(() => {
    handlers = {};
    mindmap = { getId: () => '1' };
    persistence = { save: jest.fn(), unlockMap: jest.fn() };
    dispose = jest.fn();

    (buildDesigner as jest.Mock).mockReset();
    (buildDesigner as jest.Mock).mockImplementation(() => ({
      addEvent: (type: string, handler: () => void) => {
        (handlers[type] = handlers[type] || []).push(handler);
      },
      getMindmap: () => mindmap,
      getMindmapProperties: () => ({}),
      dispose,
    }));

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    component = document.createElement('mindplot-test-component') as MindplotWebComponent;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('save (D4)', () => {
    const startSave = (): { promise: Promise<void>; events: SaveEvents } => {
      const promise = component.save(false);
      const { calls } = persistence.save.mock;
      return { promise, events: calls[calls.length - 1][3] };
    };

    beforeEach(() => {
      build('edition-owner');
      fire('loadSuccess');
      fire('modelUpdate');
      expect(component.getSaveRequired()).toBe(true);
    });

    it('clears the dirty flag when nothing changed during the save', async () => {
      const { promise, events } = startSave();
      events.onSuccess();
      await promise;

      expect(component.getSaveRequired()).toBe(false);
    });

    it('keeps the dirty flag when the model changed while the save was in flight', async () => {
      const { promise, events } = startSave();
      fire('modelUpdate');
      events.onSuccess();
      await promise;

      expect(component.getSaveRequired()).toBe(true);
    });

    it('clears the dirty flag once the save covering the latest change completes', async () => {
      const first = startSave();
      fire('modelUpdate');
      const second = startSave();

      first.events.onSuccess();
      await first.promise;
      expect(component.getSaveRequired()).toBe(true);

      second.events.onSuccess();
      await second.promise;
      expect(component.getSaveRequired()).toBe(false);
    });

    it('passes the urgent flag of a flush to the persistence manager (B-FIREFORGET)', () => {
      component.save(false, { urgent: true });
      const { calls } = persistence.save.mock;
      expect(calls[calls.length - 1][4]).toEqual({ urgent: true });
    });
  });

  describe('render mode (B-MODE)', () => {
    it('defaults to a read-only mode when no mode attribute is set', () => {
      const options = build();
      expect(isReadOnly(options)).toBe(true);
    });

    it('keeps the mode given by the attribute', () => {
      const options = build('edition-owner');
      expect(options.mode).toBe('edition-owner');
      expect(isReadOnly(options)).toBe(false);
    });
  });

  describe('unlockMap (B-UNLOCK)', () => {
    it('does not throw when the map could not be loaded', () => {
      build('edition-owner');
      mindmap = null;

      expect(() => component.unlockMap()).not.toThrow();
      expect(persistence.unlockMap).not.toHaveBeenCalled();
    });

    it('unlocks a loaded map', () => {
      build('edition-owner');

      component.unlockMap();
      expect(persistence.unlockMap).toHaveBeenCalledWith('1');
    });

    it('returns the unlock request so a caller can wait for it (B-FIREFORGET)', async () => {
      build('edition-owner');
      let settle: () => void = () => undefined;
      persistence.unlockMap.mockReturnValue(
        new Promise<void>((resolve) => {
          settle = resolve;
        }),
      );

      let done = false;
      const result = component.unlockMap().then(() => {
        done = true;
      });
      await Promise.resolve();
      expect(done).toBe(false);
      settle();
      await result;
      expect(done).toBe(true);
    });
  });

  describe('default persistence (BL5-27)', () => {
    it('falls back to a LocalStorageManager when no persistence is given', () => {
      component.setAttribute('mode', 'edition-owner');
      component.buildDesigner(undefined, {} as unknown as WidgetBuilder);

      const { calls } = (buildDesigner as jest.Mock).mock;
      const options: DesignerOptions = calls[calls.length - 1][0];
      expect(options.persistenceManager).toBeInstanceOf(LocalStorageManager);
    });
  });

  describe('persistence (BL5-36)', () => {
    const other = () =>
      ({
        save: jest.fn(),
        unlockMap: jest.fn(),
        load: jest.fn(),
      }) as unknown as PersistenceManager;

    it('saves and unlocks through the persistence it was built with', () => {
      build('edition-owner');
      // Another designer built afterwards replaces the static instance ...
      const another = other();
      PersistenceManager.init(another);

      component.save(true);
      component.unlockMap();

      expect(persistence.save).toHaveBeenCalledTimes(1);
      expect(persistence.unlockMap).toHaveBeenCalledWith('1');
      expect(another.save).not.toHaveBeenCalled();
      expect(another.unlockMap).not.toHaveBeenCalled();
    });

    it('loads through the persistence it was built with', async () => {
      const load = jest.fn().mockResolvedValue({});
      Object.assign(persistence, { load });
      const loadMap = jest.fn();
      (buildDesigner as jest.Mock).mockImplementation(() => ({ addEvent: jest.fn(), loadMap }));
      build('edition-owner');
      PersistenceManager.init(other());

      await component.loadMap('1');

      expect(load).toHaveBeenCalledWith('1');
      expect(loadMap).toHaveBeenCalled();
    });

    it('clears the static instance it set once the element leaves the page', async () => {
      build('edition-owner');
      PersistenceManager.init(persistence as unknown as PersistenceManager);
      document.body.appendChild(component);

      component.remove();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(PersistenceManager.getInstance()).toBeUndefined();
      // Pending changes can still be saved and the map unlocked ...
      component.unlockMap();
      expect(persistence.unlockMap).toHaveBeenCalledWith('1');
    });

    it('keeps a static instance set by another designer', async () => {
      build('edition-owner');
      const another = other();
      PersistenceManager.init(another);
      document.body.appendChild(component);

      component.remove();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(PersistenceManager.getInstance()).toBe(another);
    });
  });

  describe('disconnect (BL-48)', () => {
    const flushMicrotasks = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    afterEach(() => {
      component.remove();
    });

    it('disposes the designer once the element leaves the page', async () => {
      build('edition-owner');
      document.body.appendChild(component);

      component.remove();
      await flushMicrotasks();

      expect(dispose).toHaveBeenCalledTimes(1);
      // The designer stays reachable, so that pending changes can still be saved ...
      expect(component.getDesigner()).toBeDefined();
    });

    it('keeps the designer when the element is only moved', async () => {
      build('edition-owner');
      const first = document.createElement('div');
      const second = document.createElement('div');
      document.body.append(first, second);
      first.appendChild(component);

      second.appendChild(component);
      await flushMicrotasks();

      expect(dispose).not.toHaveBeenCalled();
      first.remove();
      second.remove();
    });

    it('does nothing when no designer was built', async () => {
      document.body.appendChild(component);
      component.remove();
      await flushMicrotasks();

      expect(dispose).not.toHaveBeenCalled();
    });
  });
});
