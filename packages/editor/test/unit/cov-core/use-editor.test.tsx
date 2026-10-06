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

/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import type { PersistenceManager } from '@wisemapping/mindplot';
import type MapInfo from '../../../src/classes/model/map-info';
import BootstrapPersistenceManager from '../../../src/classes/persistence/BootstrapPersistenceManager';
import DefaultWidgetBuilder from '../../../src/classes/default-widget-manager';
import { useEditor, EditorOptions } from '../../../src/hooks/useEditor';
import { logCriticalError } from '../../../src/utils/error-logger';

const keyboard = { pause: jest.fn(), resume: jest.fn() };
jest.mock('@wisemapping/mindplot', () => ({
  DesignerKeyboard: {
    pause: () => keyboard.pause(),
    resume: () => keyboard.resume(),
  },
  PersistenceManager: class {},
  WidgetBuilder: class {},
}));

jest.mock('../../../src/utils/error-logger', () => ({ logCriticalError: jest.fn() }));

type FakeModel = {
  component: unknown;
  loadMindmap: jest.Mock;
  registerEvents: jest.Mock;
  flushPendingChangesOnce: jest.Mock;
  dispose: jest.Mock;
};

const models: FakeModel[] = [];
const behaviour = {
  load: (): Promise<void> => Promise.resolve(),
  flush: (): Promise<void> => Promise.resolve(),
};

jest.mock('../../../src/classes/model/editor', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((component: unknown) => {
    const model: FakeModel = {
      component,
      loadMindmap: jest.fn(() => behaviour.load()),
      registerEvents: jest.fn(),
      flushPendingChangesOnce: jest.fn(() => behaviour.flush()),
      dispose: jest.fn(),
    };
    models.push(model);
    return model;
  }),
}));

const mapInfo = (locked = false): MapInfo =>
  ({ getId: () => '42', isLocked: () => locked }) as unknown as MapInfo;

const optionsOf = (overrides: Partial<EditorOptions> = {}): EditorOptions => ({
  mode: 'edition-owner',
  locale: 'en',
  enableKeyboardEvents: true,
  ...overrides,
});

const persistence = { name: 'server' } as unknown as PersistenceManager;

/**
 * The hook builds the model only once the canvas element is attached to its
 * ref, which happens after the first render; this attaches it and re-renders.
 */
const mountWithCanvas = (options: EditorOptions, info: MapInfo = mapInfo()) => {
  const hook = renderHook(
    (props: { options: EditorOptions }) =>
      useEditor({ mapInfo: info, options: props.options, persistenceManager: persistence }),
    { initialProps: { options } },
  );
  const canvas = { tagName: 'mindplot-component' };
  hook.result.current.mindplotRef.current = canvas;
  hook.rerender({ options: { ...options } });
  return { ...hook, canvas };
};

beforeEach(() => {
  models.length = 0;
  behaviour.load = () => Promise.resolve();
  behaviour.flush = () => Promise.resolve();
  keyboard.pause.mockClear();
  keyboard.resume.mockClear();
  (logCriticalError as jest.Mock).mockClear();
});

describe('useEditor', () => {
  it('derives the capability from the mode and the lock', () => {
    const { result } = renderHook(() =>
      useEditor({
        mapInfo: mapInfo(true),
        options: optionsOf({ mode: 'viewonly-public' }),
        persistenceManager: persistence,
      }),
    );
    expect(result.current.capability.mode).toBe('viewonly-public');
    expect(result.current.capability.isLocked).toBe(true);
    expect(result.current.model).toBeUndefined();
  });

  it('builds no model before the canvas is attached', () => {
    renderHook(() =>
      useEditor({ mapInfo: mapInfo(), options: optionsOf(), persistenceManager: persistence }),
    );
    expect(models).toHaveLength(0);
  });

  it('loads the map through the given persistence once the canvas is attached', async () => {
    const { result, canvas } = mountWithCanvas(optionsOf());

    await waitFor(() => expect(result.current.model).toBeDefined());
    const model = models[0];
    expect(model.component).toBe(canvas);
    expect(model.loadMindmap).toHaveBeenCalledWith(
      '42',
      persistence,
      expect.any(DefaultWidgetBuilder),
    );
    await waitFor(() => expect(model.registerEvents).toHaveBeenCalled());
    expect(model.registerEvents.mock.calls[0][1]).toBe(result.current.capability);
  });

  it('loads from the bootstrap XML when one is given', async () => {
    const { result } = mountWithCanvas(
      optionsOf({ bootstrapXML: '<map><topic central="true"/></map>' }),
    );

    await waitFor(() => expect(result.current.model).toBeDefined());
    expect(models[0].loadMindmap.mock.calls[0][1]).toBeInstanceOf(BootstrapPersistenceManager);
  });

  it('logs a map that fails to load', async () => {
    behaviour.load = () => Promise.reject(new Error('not found'));
    mountWithCanvas(optionsOf());

    await waitFor(() =>
      expect(logCriticalError).toHaveBeenCalledWith(
        'Unexpected error loading mindmap with id 42',
        expect.any(Error),
      ),
    );
    expect(models[0].registerEvents).not.toHaveBeenCalled();
  });

  it('builds the model only once across re-renders', async () => {
    const { result, rerender } = mountWithCanvas(optionsOf());
    await waitFor(() => expect(result.current.model).toBeDefined());

    rerender({ options: optionsOf() });

    expect(models).toHaveLength(1);
  });

  it('saves and disposes the model when unmounted', async () => {
    const { result, unmount } = mountWithCanvas(optionsOf());
    await waitFor(() => expect(result.current.model).toBeDefined());

    unmount();

    expect(models[0].flushPendingChangesOnce).toHaveBeenCalled();
    expect(models[0].dispose).toHaveBeenCalled();
  });

  it('logs a save that fails while leaving', async () => {
    behaviour.flush = () => Promise.reject(new Error('offline'));
    const { result, unmount } = mountWithCanvas(optionsOf());
    await waitFor(() => expect(result.current.model).toBeDefined());

    unmount();

    await waitFor(() =>
      expect(logCriticalError).toHaveBeenCalledWith(
        'Unexpected error saving map before leaving editor',
        expect.any(Error),
      ),
    );
  });

  it('pauses the keyboard while keyboard events are disabled, and resumes on unmount', () => {
    const { unmount } = renderHook(() =>
      useEditor({
        mapInfo: mapInfo(),
        options: optionsOf({ enableKeyboardEvents: false }),
        persistenceManager: persistence,
      }),
    );
    expect(keyboard.pause).toHaveBeenCalledTimes(1);
    expect(keyboard.resume).not.toHaveBeenCalled();

    unmount();

    expect(keyboard.resume).toHaveBeenCalledTimes(1);
  });

  it('leaves the keyboard alone while keyboard events are enabled', () => {
    const { unmount } = renderHook(() =>
      useEditor({ mapInfo: mapInfo(), options: optionsOf(), persistenceManager: persistence }),
    );
    unmount();
    expect(keyboard.pause).not.toHaveBeenCalled();
    expect(keyboard.resume).not.toHaveBeenCalled();
  });
});
