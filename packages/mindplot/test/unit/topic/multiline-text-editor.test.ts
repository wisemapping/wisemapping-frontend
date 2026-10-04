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

jest.mock('../../../src/components/SvgImageIcon', () => ({
  __esModule: true,
  default: class MockSvgImageIcon {},
}));

import ActionDispatcher from '../../../src/components/ActionDispatcher';
import MultitTextEditor from '../../../src/components/MultilineTextEditor';
import Topic from '../../../src/components/Topic';
import { buildTopics, stubSvgMeasurement } from './Helper';

let changeTextToTopic: jest.Mock;
let mindmapComp: HTMLElement;

const editor = () => MultitTextEditor.getInstance();

const textarea = (): HTMLTextAreaElement =>
  document.querySelector('#textContainer textarea') as HTMLTextAreaElement;

const keydown = (init: KeyboardEventInit & { keyCode?: number }) => {
  textarea().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
};

const openEditor = (topic: Topic, text?: string) => {
  editor().show(topic, text);
};

beforeAll(() => {
  stubSvgMeasurement();
});

beforeEach(() => {
  const wrapper = document.createElement('div');
  mindmapComp = document.createElement('div');
  mindmapComp.id = 'mindmap-comp';
  wrapper.appendChild(mindmapComp);
  document.body.appendChild(wrapper);

  changeTextToTopic = jest.fn();
  ActionDispatcher.setInstance({
    changeTextToTopic,
    getCommandContext: () => ({
      designer: { getModel: () => ({ getTopics: () => topics }) },
    }),
  } as unknown as ActionDispatcher);
});

afterEach(() => {
  editor().close(false);
  document.body.innerHTML = '';
});

let topics: Topic[] = [];

describe('MultilineTextEditor Escape', () => {
  it('leaves an empty topic empty instead of saving the placeholder', () => {
    const { central } = buildTopics();
    topics = [central];
    expect(central.getModel().getText()).toBeFalsy();
    const placeholder = central.getText();
    expect(placeholder).not.toBe('');

    openEditor(central, 'x');
    keydown({ code: 'Escape', key: 'Escape' });

    expect(editor().isActive()).toBe(false);
    expect(central.getModel().getText()).toBeFalsy();
    // The placeholder is still what the topic shows.
    expect(central.getText()).toBe(placeholder);
    expect(central.getOrBuildTextShape().getText()).toBe(placeholder);
  });

  it('restores the previous text of a topic that has one', () => {
    const { child } = buildTopics();
    topics = [child];

    openEditor(child, 'x');
    expect(child.getModel().getText()).toBe('x');
    keydown({ code: 'Escape', key: 'Escape' });

    expect(child.getModel().getText()).toBe('Child');
    expect(changeTextToTopic).not.toHaveBeenCalled();
  });
});

describe('MultilineTextEditor IME composition', () => {
  it('does not commit on Enter while composing', () => {
    const { child } = buildTopics();
    topics = [child];

    openEditor(child);
    keydown({ code: 'Enter', key: 'Enter', isComposing: true });

    expect(editor().isActive()).toBe(true);
    expect(changeTextToTopic).not.toHaveBeenCalled();
  });

  it('does not commit on Enter reported with the IME key code', () => {
    const { child } = buildTopics();
    topics = [child];

    openEditor(child);
    keydown({ code: 'Enter', key: 'Process', keyCode: 229 });

    expect(editor().isActive()).toBe(true);
    expect(changeTextToTopic).not.toHaveBeenCalled();
  });

  it('commits on a plain Enter', () => {
    const { child } = buildTopics();
    topics = [child];

    openEditor(child);
    textarea().value = 'New text';
    keydown({ code: 'Enter', key: 'Enter' });

    expect(editor().isActive()).toBe(false);
    expect(changeTextToTopic).toHaveBeenCalledWith([child.getId()], 'New text');
  });

  it('keeps the Enter that commits from adding a new line to the topic', () => {
    const { child } = buildTopics();
    topics = [child];

    openEditor(child);
    const textareaElem = textarea();
    textareaElem.value = 'New text';
    const enter = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      code: 'Enter',
      key: 'Enter',
    });
    textareaElem.dispatchEvent(enter);

    // Browsers insert the new line as the default action of the keydown ...
    expect(enter.defaultPrevented).toBe(true);

    // ... and an input event that still arrives after closing must not touch the topic.
    textareaElem.value = 'New text\n';
    textareaElem.dispatchEvent(new Event('input', { bubbles: true }));
    expect(child.getModel().getText()).not.toBe('New text\n');
  });
});

describe('MultilineTextEditor input', () => {
  it('updates the topic and the editor size on paste or delete', () => {
    const { child } = buildTopics();
    topics = [child];

    openEditor(child);
    textarea().value = 'A much longer pasted text';
    textarea().dispatchEvent(new Event('input', { bubbles: true }));

    expect(child.getModel().getText()).toBe('A much longer pasted text');
    expect(textarea().getAttribute('cols')).toBe(String('A much longer pasted text'.length));

    textarea().value = 'A';
    textarea().dispatchEvent(new Event('input', { bubbles: true }));

    expect(child.getModel().getText()).toBe('A');
    expect(textarea().getAttribute('cols')).toBe('1');
  });
});
