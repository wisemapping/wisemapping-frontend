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
import type {
  MindplotWebComponent,
  PersistenceManager,
  WidgetBuilder,
} from '@wisemapping/mindplot';
import type Capability from '../../../src/classes/action/capability';
import Editor from '../../../src/classes/model/editor';
import { trackEditorInteraction } from '../../../src/utils/analytics';

jest.mock('@wisemapping/mindplot', () => ({}));

jest.mock('../../../src/utils/analytics', () => ({
  trackEditorInteraction: jest.fn(),
}));

type Handler = (payload?: unknown) => void;

const buildComponent = (options: { selectedTopic?: unknown; loaded?: boolean } = {}) => {
  const handlers: Record<string, Handler[]> = {};
  const designer = {
    addEvent: jest.fn((type: string, handler: Handler) => {
      handlers[type] = [...(handlers[type] || []), handler];
    }),
    removeEvent: jest.fn((type: string, handler: Handler) => {
      handlers[type] = (handlers[type] || []).filter((h) => h !== handler);
    }),
    getModel: jest.fn(() => ({ selectedTopic: () => options.selectedTopic })),
    dispose: jest.fn(),
  };
  const component = {
    save: jest.fn((): Promise<void> => Promise.resolve()),
    isLoaded: jest.fn(() => options.loaded ?? true),
    unlockMap: jest.fn(),
    getDesigner: jest.fn(() => designer),
    buildDesigner: jest.fn(() => designer),
    loadMap: jest.fn((): Promise<void> => Promise.resolve()),
  };
  const fire = (type: string, payload?: unknown) =>
    (handlers[type] || []).forEach((h) => h(payload));
  const count = (type: string) => (handlers[type] || []).length;
  return { component, designer, fire, count };
};

const editorFor = (component: unknown) => new Editor(component as MindplotWebComponent);

const visible = { isHidden: () => false } as unknown as Capability;
const saveHidden = {
  isHidden: (action: string) => action === 'save',
} as unknown as Capability;

describe('Editor accessors', () => {
  it('reports whether the map is loaded', () => {
    const loaded = buildComponent({ loaded: true });
    const notLoaded = buildComponent({ loaded: false });
    expect(editorFor(loaded.component).isMapLoadded()).toBe(true);
    expect(editorFor(notLoaded.component).isMapLoadded()).toBe(false);
  });

  it('exposes the designer and its model', () => {
    const { component, designer } = buildComponent({ selectedTopic: 'topic' });
    const editor = editorFor(component);
    expect(editor.getDesigner()).toBe(designer);
    expect(editor.getDesignerModel()?.selectedTopic()).toBe('topic');
  });

  it('throws when there is no component to save through', () => {
    const editor = editorFor(undefined);
    expect(() => editor.save(true)).toThrow('Designer object has not been initialized.');
    expect(() => editor.getDesigner()).toThrow('Designer object has not been initialized.');
  });
});

describe('Editor.loadMindmap', () => {
  it('builds the designer with the persistence and widgets, then loads the map', async () => {
    const { component } = buildComponent();
    const editor = editorFor(component);
    const persistence = {} as PersistenceManager;
    const widgets = {} as WidgetBuilder;

    await editor.loadMindmap('42', persistence, widgets);

    expect(component.buildDesigner).toHaveBeenCalledWith(persistence, widgets);
    expect(component.loadMap).toHaveBeenCalledWith('42');
  });

  it('disposes the built designer when the editor is disposed', async () => {
    const { component, designer } = buildComponent();
    const editor = editorFor(component);
    await editor.loadMindmap('1', {} as PersistenceManager, {} as WidgetBuilder);

    editor.dispose();
    editor.dispose();

    expect(designer.dispose).toHaveBeenCalledTimes(1);
  });
});

describe('Editor.registerEvents', () => {
  it('redraws on focus and on model updates', () => {
    const { component, fire } = buildComponent();
    const canvasUpdate = jest.fn();
    editorFor(component).registerEvents(canvasUpdate, saveHidden, {} as WidgetBuilder);

    fire('onfocus');
    fire('modelUpdate');

    expect(canvasUpdate).toHaveBeenCalledTimes(2);
    expect(typeof canvasUpdate.mock.calls[0][0]).toBe('number');
  });

  it('redraws on blur only once nothing is selected', () => {
    const selected = buildComponent({ selectedTopic: { id: 1 } });
    const selectedUpdate = jest.fn();
    editorFor(selected.component).registerEvents(selectedUpdate, saveHidden, {} as WidgetBuilder);
    selected.fire('onblur');
    expect(selectedUpdate).not.toHaveBeenCalled();

    const empty = buildComponent({ selectedTopic: undefined });
    const emptyUpdate = jest.fn();
    editorFor(empty.component).registerEvents(emptyUpdate, saveHidden, {} as WidgetBuilder);
    empty.fire('onblur');
    expect(emptyUpdate).toHaveBeenCalledTimes(1);
  });

  it.each(['note', 'link'])('opens the %s editor on a feature edit', (event) => {
    const { component, fire } = buildComponent();
    const canvasUpdate = jest.fn();
    const widgets = { fireEvent: jest.fn() } as unknown as WidgetBuilder;
    editorFor(component).registerEvents(canvasUpdate, saveHidden, widgets);
    const topic = { id: 7 };

    fire('featureEdit', { event, topic });

    expect(widgets.fireEvent).toHaveBeenCalledWith(event, topic);
    expect(trackEditorInteraction).toHaveBeenCalledWith(`${event}_editor_open`);
    expect(canvasUpdate).toHaveBeenCalledTimes(1);
  });

  it('only redraws for another feature edit', () => {
    const { component, fire } = buildComponent();
    const canvasUpdate = jest.fn();
    const widgets = { fireEvent: jest.fn() } as unknown as WidgetBuilder;
    editorFor(component).registerEvents(canvasUpdate, saveHidden, widgets);

    fire('featureEdit', { event: 'close' });

    expect(widgets.fireEvent).not.toHaveBeenCalled();
    expect(canvasUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not autosave or listen for unload when saving is hidden', () => {
    jest.useFakeTimers();
    try {
      const addSpy = jest.spyOn(window, 'addEventListener');
      const { component, fire } = buildComponent();
      editorFor(component).registerEvents(jest.fn(), saveHidden, {} as WidgetBuilder);

      fire('modelUpdate');
      jest.advanceTimersByTime(20000);

      expect(component.save).not.toHaveBeenCalled();
      expect(addSpy.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(0);
      addSpy.mockRestore();
    } finally {
      jest.useRealTimers();
    }
  });

  it('does nothing without a designer', () => {
    const { component } = buildComponent();
    component.getDesigner.mockReturnValue(undefined as never);
    expect(() =>
      editorFor(component).registerEvents(jest.fn(), visible, {} as WidgetBuilder),
    ).not.toThrow();
  });

  it('replaces the handlers of a previous registration', () => {
    const { component, count } = buildComponent();
    const editor = editorFor(component);

    editor.registerEvents(jest.fn(), saveHidden, {} as WidgetBuilder);
    editor.registerEvents(jest.fn(), saveHidden, {} as WidgetBuilder);

    expect(count('onfocus')).toBe(1);
    expect(count('featureEdit')).toBe(1);
    editor.dispose();
    expect(count('onfocus')).toBe(0);
  });

  it('logs a failed autosave instead of throwing', async () => {
    jest.useFakeTimers();
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const { component, fire } = buildComponent();
      component.save.mockImplementation(() => Promise.reject(new Error('offline')));
      const editor = editorFor(component);
      editor.registerEvents(jest.fn(), visible, {} as WidgetBuilder);

      fire('modelUpdate');
      jest.advanceTimersByTime(15000);
      await Promise.resolve();
      await Promise.resolve();

      expect(error).toHaveBeenCalledWith('Autosave failed:', expect.any(Error));
      editor.dispose();
    } finally {
      error.mockRestore();
      jest.useRealTimers();
    }
  });
});

describe('Editor flush', () => {
  it('skips the save and the unlock when the map never loaded', async () => {
    const { component } = buildComponent({ loaded: false });
    await editorFor(component).flushPendingChanges();
    expect(component.save).not.toHaveBeenCalled();
    expect(component.unlockMap).not.toHaveBeenCalled();
  });

  it('still unlocks the map when the save fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { component } = buildComponent();
    component.save.mockImplementation(() => Promise.reject(new Error('offline')));

    await expect(editorFor(component).flushPendingChanges()).resolves.toBeUndefined();

    expect(component.unlockMap).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('Save failed while leaving editor:', expect.any(Error));
    error.mockRestore();
  });

  it('unlocks once on unload even when the save fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { component } = buildComponent();
    component.save.mockImplementation(() => Promise.reject(new Error('offline')));

    await editorFor(component).flushPendingChanges(true);

    expect(component.unlockMap).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it('warns rather than throws when the unlock fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { component } = buildComponent();
    component.unlockMap.mockImplementation(() => {
      throw new Error('gone');
    });

    await expect(editorFor(component).flushPendingChanges()).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith('Failed to unlock map:', expect.any(Error));
    warn.mockRestore();
  });

  it('shares one flush between concurrent callers, and starts a new one afterwards', async () => {
    const { component } = buildComponent();
    let resolveSave: () => void = () => undefined;
    component.save.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const editor = editorFor(component);

    const first = editor.flushPendingChangesOnce();
    const second = editor.flushPendingChangesOnce();
    expect(second).toBe(first);
    resolveSave();
    await first;
    expect(component.save).toHaveBeenCalledTimes(1);

    component.save.mockImplementation(() => Promise.resolve());
    await editor.flushPendingChangesOnce();
    expect(component.save).toHaveBeenCalledTimes(2);
  });

  it('logs a failed flush triggered by leaving the page', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { component } = buildComponent();
    const editor = editorFor(component);
    editor.registerEvents(jest.fn(), visible, {} as WidgetBuilder);
    jest
      .spyOn(editor, 'flushPendingChangesOnce')
      .mockImplementation(() => Promise.reject(new Error('boom')));

    window.dispatchEvent(new Event('beforeunload'));
    await Promise.resolve();
    await Promise.resolve();

    expect(error).toHaveBeenCalledWith('Save failed on beforeunload:', expect.any(Error));
    editor.dispose();
    error.mockRestore();
  });
});
