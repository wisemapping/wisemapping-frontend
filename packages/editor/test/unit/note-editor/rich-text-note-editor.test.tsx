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
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import RichTextNoteEditor from '../../../src/components/action-widget/pane/rich-text-note-editor';
import type NodeProperty from '../../../src/classes/model/node-property';

jest.mock('emoji-picker-react', () => ({
  __esModule: true,
  default: () => null,
  EmojiStyle: { NATIVE: 'native' },
  Theme: { DARK: 'dark', LIGHT: 'light' },
}));

const renderEditor = (value: string | undefined) => {
  const model: NodeProperty<string | undefined> = {
    getValue: () => value,
    setValue: jest.fn(),
  };
  const closeModal = jest.fn();
  const view = render(
    <IntlProvider locale="en" messages={{}}>
      <RichTextNoteEditor closeModal={closeModal} noteModel={model} />
    </IntlProvider>,
  );
  const editor = view.container.querySelector('[contenteditable]') as HTMLDivElement;
  return { model, closeModal, editor };
};

const caretIn = (node: Node, offset: number): void => {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  window.getSelection()!.removeAllRanges();
  window.getSelection()!.addRange(range);
};

describe('RichTextNoteEditor', () => {
  test('sanitizes the note before editing it', () => {
    const hook = jest.fn();
    (window as unknown as { __noteXss: () => void }).__noteXss = hook;

    const { editor } = renderEditor(
      '<ul><li>a<ul><li>b</li></ul></li></ul><img src="x" onerror="window.__noteXss()"><a href="javascript:alert(1)">x</a>',
    );

    expect(editor.querySelector('li li')?.textContent).toBe('b');
    expect(editor.innerHTML).not.toMatch(/onerror|javascript:/i);
    expect(hook).not.toHaveBeenCalled();
  });

  test('saves nested lists, sanitized', () => {
    const { editor, model } = renderEditor('<ul><li>a</li><li>b</li></ul>');
    caretIn(editor.querySelectorAll('li')[1].firstChild!, 0);

    fireEvent.keyDown(editor, { key: 'Tab' });
    editor.appendChild(document.createElement('script'));
    fireEvent.input(editor);
    fireEvent.click(screen.getByText('Accept'));

    expect(model.setValue).toHaveBeenCalledWith('<ul><li>a<ul><li>b</li></ul></li></ul>');
  });

  test('the indent buttons nest and unnest the item with the caret', () => {
    const { editor } = renderEditor('<ol><li>a</li><li>b</li></ol>');
    caretIn(editor.querySelectorAll('li')[1].firstChild!, 1);

    fireEvent.click(screen.getByTitle('Increase Indent (Tab)'));
    expect(editor.innerHTML).toBe('<ol><li>a<ol><li>b</li></ol></li></ol>');

    fireEvent.click(screen.getByTitle('Decrease Indent (Shift+Tab)'));
    expect(editor.innerHTML).toBe('<ol><li>a</li><li>b</li></ol>');
  });

  test('converts Markdown typed in the note', () => {
    const { editor } = renderEditor(undefined);
    act(() => {
      editor.textContent = '- ';
    });
    caretIn(editor.firstChild!, 2);

    fireEvent.input(editor, { inputType: 'insertText', data: ' ' });

    expect(editor.innerHTML).toBe('<ul><li><br></li></ul>');
  });

  test('never creates a link to an unsafe url from the link button', () => {
    const execCommand = jest.fn(() => true);
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
    const prompt = jest.spyOn(window, 'prompt');
    renderEditor('<div>text</div>');

    prompt.mockReturnValueOnce('javascript:alert(1)');
    fireEvent.click(screen.getByTitle('Insert Link'));
    expect(execCommand).not.toHaveBeenCalled();

    prompt.mockReturnValueOnce('example.org/page');
    fireEvent.click(screen.getByTitle('Insert Link'));
    expect(execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.org/page');

    prompt.mockRestore();
    delete (document as unknown as { execCommand?: unknown }).execCommand;
  });
});
