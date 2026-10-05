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
import type { MindplotWebComponent, WidgetBuilder } from '@wisemapping/mindplot';
import type Capability from '../../../src/classes/action/capability';
import Editor from '../../../src/classes/model/editor';

jest.mock('@wisemapping/mindplot', () => ({}));

jest.mock('../../../src/utils/analytics', () => ({
  trackEditorInteraction: jest.fn(),
}));

type Handler = () => void;

// MindplotWebComponent.save(saveHistory): true records a history entry (an
// explicit save), false is a minor save that is skipped when nothing changed.
const buildComponent = () => {
  const handlers: Record<string, Handler[]> = {};
  const designer = {
    addEvent: (type: string, handler: Handler) => {
      handlers[type] = [...(handlers[type] || []), handler];
    },
    removeEvent: (type: string, handler: Handler) => {
      handlers[type] = (handlers[type] || []).filter((h) => h !== handler);
    },
    getModel: () => ({ selectedTopic: () => undefined }),
  };
  const component = {
    save: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true),
    unlockMap: jest.fn(),
    getDesigner: () => designer,
  };
  const fire = (type: string) => (handlers[type] || []).forEach((h) => h());
  return { component, fire };
};

describe('Editor save', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('records a history entry for an explicit save', async () => {
    const { component } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);

    await editor.save(true);

    expect(component.save).toHaveBeenCalledTimes(1);
    expect(component.save).toHaveBeenCalledWith(true);
  });

  it('autosaves as a minor save, without a history entry', () => {
    jest.useFakeTimers();
    const { component, fire } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);
    const capability = { isHidden: () => false } as unknown as Capability;

    editor.registerEvents(jest.fn(), capability, {} as WidgetBuilder);
    fire('modelUpdate');
    jest.advanceTimersByTime(15000);

    expect(component.save).toHaveBeenCalledTimes(1);
    expect(component.save).toHaveBeenCalledWith(false);
  });

  it('cancels a pending autosave when disposed (BL4-57)', () => {
    jest.useFakeTimers();
    const { component, fire } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);
    const capability = { isHidden: () => false } as unknown as Capability;

    editor.registerEvents(jest.fn(), capability, {} as WidgetBuilder);
    fire('modelUpdate');
    editor.dispose();
    jest.advanceTimersByTime(15000);

    expect(component.save).not.toHaveBeenCalled();
  });

  it('does not autosave on a model update after it is disposed (BL4-57)', () => {
    jest.useFakeTimers();
    const { component, fire } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);
    const capability = { isHidden: () => false } as unknown as Capability;

    editor.registerEvents(jest.fn(), capability, {} as WidgetBuilder);
    editor.dispose();
    fire('modelUpdate');
    jest.advanceTimersByTime(15000);

    expect(component.save).not.toHaveBeenCalled();
  });

  it('flushes pending changes as a minor save', async () => {
    const { component } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);

    await editor.flushPendingChanges();

    expect(component.save).toHaveBeenCalledTimes(1);
    expect(component.save).toHaveBeenCalledWith(false, { urgent: true });
    expect(component.unlockMap).toHaveBeenCalled();
  });
});

describe('Editor flush when leaving', () => {
  it('flushes as an urgent save, so the save rate limit is skipped', async () => {
    const { component } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);

    await editor.flushPendingChanges();

    expect(component.save).toHaveBeenCalledWith(false, { urgent: true });
  });

  it('unlocks only after the save completes while the page stays open', async () => {
    const { component } = buildComponent();
    let resolveSave: () => void = () => undefined;
    component.save.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const editor = new Editor(component as unknown as MindplotWebComponent);

    const flushed = editor.flushPendingChanges();
    await Promise.resolve();
    expect(component.unlockMap).not.toHaveBeenCalled();

    resolveSave();
    await flushed;
    expect(component.unlockMap).toHaveBeenCalledTimes(1);
  });

  it('unlocks right away on beforeunload, without waiting for the save response', () => {
    const { component } = buildComponent();
    // The page is gone before the response arrives.
    component.save.mockImplementation(() => new Promise<void>(() => undefined));
    const editor = new Editor(component as unknown as MindplotWebComponent);
    const capability = { isHidden: () => false } as unknown as Capability;
    editor.registerEvents(jest.fn(), capability, {} as WidgetBuilder);

    window.dispatchEvent(new Event('beforeunload'));

    expect(component.save).toHaveBeenCalledWith(false, { urgent: true });
    expect(component.unlockMap).toHaveBeenCalledTimes(1);
    editor.dispose();
  });

  it('removes the beforeunload listener when disposed', () => {
    const { component } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);
    const capability = { isHidden: () => false } as unknown as Capability;
    editor.registerEvents(jest.fn(), capability, {} as WidgetBuilder);

    editor.dispose();
    window.dispatchEvent(new Event('beforeunload'));

    expect(component.save).not.toHaveBeenCalled();
    expect(component.unlockMap).not.toHaveBeenCalled();
  });

  it('keeps a single beforeunload listener when events are registered again', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { component } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);
    const capability = { isHidden: () => false } as unknown as Capability;

    editor.registerEvents(jest.fn(), capability, {} as WidgetBuilder);
    editor.registerEvents(jest.fn(), capability, {} as WidgetBuilder);
    editor.dispose();

    const added = addSpy.mock.calls.filter(([type]) => type === 'beforeunload').map((c) => c[1]);
    const removed = removeSpy.mock.calls
      .filter(([type]) => type === 'beforeunload')
      .map((c) => c[1]);
    expect(added).toHaveLength(2);
    expect(removed).toEqual(expect.arrayContaining(added));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

describe('Editor dispose (BL5-25)', () => {
  it('stops forwarding the designer events to the editor once disposed', () => {
    const { component, fire } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);
    const capability = { isHidden: () => false } as unknown as Capability;
    const canvasUpdate = jest.fn();
    const widgetBuilder = { fireEvent: jest.fn() } as unknown as WidgetBuilder;

    editor.registerEvents(canvasUpdate, capability, widgetBuilder);
    editor.dispose();
    ['onblur', 'onfocus', 'modelUpdate', 'featureEdit'].forEach((type) => fire(type));

    expect(canvasUpdate).not.toHaveBeenCalled();
  });

  it('keeps a single set of handlers when events are registered again', () => {
    const { component, fire } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);
    const capability = { isHidden: () => true } as unknown as Capability;
    const canvasUpdate = jest.fn();

    editor.registerEvents(canvasUpdate, capability, {} as WidgetBuilder);
    editor.registerEvents(canvasUpdate, capability, {} as WidgetBuilder);
    fire('onfocus');

    expect(canvasUpdate).toHaveBeenCalledTimes(1);
    editor.dispose();
  });
});
