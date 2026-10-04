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

  it('flushes pending changes as a minor save', async () => {
    const { component } = buildComponent();
    const editor = new Editor(component as unknown as MindplotWebComponent);

    await editor.flushPendingChanges();

    expect(component.save).toHaveBeenCalledTimes(1);
    expect(component.save).toHaveBeenCalledWith(false);
    expect(component.unlockMap).toHaveBeenCalled();
  });
});
