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
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import RichTextNoteEditor from '../../../src/components/action-widget/pane/rich-text-note-editor';
import { property, readOnlyProperty, renderPane } from './helpers';

jest.mock('emoji-picker-react', () => jest.requireActual('./emoji-picker-mock'));

type ExecCommand = (command: string, showUi?: boolean, value?: string) => boolean;

/** jsdom has no document.execCommand; the editor's formatting relies on it. */
const note = (value: string | undefined) => property<string | undefined>(value);

let execCommand: jest.Mock<boolean, Parameters<ExecCommand>>;

beforeEach(() => {
  execCommand = jest.fn<boolean, Parameters<ExecCommand>>(() => true);
  Object.defineProperty(document, 'execCommand', {
    value: execCommand,
    configurable: true,
    writable: true,
  });
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  // The editor leaves no debug output (cursor bookkeeping, insertText result) behind.
  expect(console.log).not.toHaveBeenCalled();
  jest.restoreAllMocks();
  delete (document as unknown as { execCommand?: ExecCommand }).execCommand;
});

const editable = (container: HTMLElement): HTMLElement => {
  const element = container.querySelector<HTMLElement>('[contenteditable]');
  if (!element) {
    throw new Error('no contentEditable area');
  }
  return element;
};

/** Types into the contentEditable area the way the browser reports it: new markup, then input. */
const typeHtml = (element: HTMLElement, html: string): void => {
  element.innerHTML = html;
  fireEvent.input(element);
};

describe('RichTextNoteEditor', () => {
  it('shows the existing note and saves it unchanged on Accept', () => {
    const noteModel = note('<b>Existing</b> note');
    const closeModal = jest.fn();
    const { container } = renderPane(
      <RichTextNoteEditor closeModal={closeModal} noteModel={noteModel} />,
    );

    expect(editable(container).innerHTML).toBe('<b>Existing</b> note');

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(noteModel.setValue).toHaveBeenCalledWith('<b>Existing</b> note');
  });

  it('counts the characters of an existing plain-text note', () => {
    renderPane(<RichTextNoteEditor closeModal={jest.fn()} noteModel={note('Plain note')} />);

    expect(screen.getByText('9990 left')).toBeTruthy();
  });

  // The initial count, like every count after an edit, is the length of the visible text, not
  // of the stored HTML (it used to start at "9980 left" and jump on the first keystroke).
  it('counts only the visible text of an existing rich-text note', () => {
    renderPane(
      <RichTextNoteEditor closeModal={jest.fn()} noteModel={note('<b>Existing</b> note')} />,
    );

    expect(screen.getByText('9987 left')).toBeTruthy();
  });

  it('saves what the user typed and counts plain-text characters', () => {
    const noteModel = property<string | undefined>(undefined);
    const closeModal = jest.fn();
    const { container } = renderPane(
      <RichTextNoteEditor closeModal={closeModal} noteModel={noteModel} />,
    );

    expect(screen.getByText('10000 left')).toBeTruthy();
    // An empty note has nothing to delete.
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();

    typeHtml(editable(container), 'Hello <i>world</i>');
    expect(screen.getByText('9989 left')).toBeTruthy();

    fireEvent.blur(editable(container));
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(noteModel.setValue).toHaveBeenCalledWith('Hello <i>world</i>');
  });

  it('does not try to save into a read-only note', () => {
    const closeModal = jest.fn();
    renderPane(
      <RichTextNoteEditor closeModal={closeModal} noteModel={readOnlyProperty('read only')} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('deletes the note through the Delete button', () => {
    const noteModel = property<string | undefined>('to be removed');
    const closeModal = jest.fn();
    renderPane(<RichTextNoteEditor closeModal={closeModal} noteModel={noteModel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(noteModel.setValue).toHaveBeenCalledWith(undefined);
  });

  it('closes without saving from the close button', () => {
    const noteModel = property<string | undefined>('keep me');
    const closeModal = jest.fn();
    renderPane(<RichTextNoteEditor closeModal={closeModal} noteModel={noteModel} />);

    fireEvent.click(screen.getByTestId('CloseIcon').closest('button') as HTMLElement);

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(noteModel.setValue).not.toHaveBeenCalled();
  });

  it.each([
    ['Bold', 'bold'],
    ['Italic', 'italic'],
    ['Underline', 'underline'],
    ['Strikethrough', 'strikeThrough'],
    ['Bullet List', 'insertUnorderedList'],
    ['Numbered List', 'insertOrderedList'],
  ])('runs the %s formatting command and keeps the formatted markup', (title, command) => {
    const noteModel = property<string | undefined>('text');
    const { container } = renderPane(
      <RichTextNoteEditor closeModal={jest.fn()} noteModel={noteModel} />,
    );
    const area = editable(container);
    execCommand.mockImplementation(() => {
      area.innerHTML = `<span>${command}</span>`;
      return true;
    });

    fireEvent.click(screen.getByTitle(title));

    expect(execCommand).toHaveBeenCalledWith(command, false, undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(noteModel.setValue).toHaveBeenCalledWith(`<span>${command}</span>`);
  });

  it('turns the selection into a link with the URL the user entered', () => {
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('https://wisemapping.com');
    renderPane(<RichTextNoteEditor closeModal={jest.fn()} noteModel={note('x')} />);

    fireEvent.click(screen.getByTitle('Insert Link'));

    expect(promptSpy).toHaveBeenCalledWith('Enter URL:');
    expect(execCommand).toHaveBeenCalledWith('createLink', false, 'https://wisemapping.com');
  });

  it('adds no link when the user cancels the URL prompt', () => {
    jest.spyOn(window, 'prompt').mockReturnValue(null);
    renderPane(<RichTextNoteEditor closeModal={jest.fn()} noteModel={note('x')} />);

    fireEvent.click(screen.getByTitle('Insert Link'));

    expect(execCommand).not.toHaveBeenCalled();
  });

  it('formats the block with the heading style picked from the menu', () => {
    renderPane(<RichTextNoteEditor closeModal={jest.fn()} noteModel={note('x')} />);

    const pick = (label: string): void => {
      fireEvent.mouseDown(screen.getByRole('combobox'));
      fireEvent.click(within(screen.getByRole('listbox')).getByText(label));
    };

    pick('Heading 1');
    expect(execCommand).toHaveBeenLastCalledWith('formatBlock', false, 'h1');
    pick('Quote');
    expect(execCommand).toHaveBeenLastCalledWith('formatBlock', false, 'blockquote');
    pick('Code Block');
    expect(execCommand).toHaveBeenLastCalledWith('formatBlock', false, 'pre');
    pick('Normal');
    expect(execCommand).toHaveBeenLastCalledWith('formatBlock', false, 'div');
  });

  it('warns when the note gets close to the character limit', () => {
    const { container } = renderPane(
      <RichTextNoteEditor closeModal={jest.fn()} noteModel={property<string | undefined>('')} />,
    );

    expect(screen.queryByText('(Approaching limit)')).toBeNull();
    typeHtml(editable(container), 'a'.repeat(9500));

    expect(screen.getByText('500 left')).toBeTruthy();
    expect(screen.getByText('(Approaching limit)')).toBeTruthy();
  });

  it('truncates a note that goes past the limit and saves the truncated text', () => {
    const noteModel = property<string | undefined>('');
    const { container } = renderPane(
      <RichTextNoteEditor closeModal={jest.fn()} noteModel={noteModel} />,
    );
    const area = editable(container);

    typeHtml(area, `<b>${'z'.repeat(10005)}</b>`);

    expect(area.textContent).toHaveLength(10000);
    expect(screen.getByText('0 left')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(noteModel.setValue).toHaveBeenCalledWith('z'.repeat(10000));
  });

  it('inserts the picked emoji at the cursor and closes the emoji picker', async () => {
    const noteModel = property<string | undefined>('note');
    const { container } = renderPane(
      <RichTextNoteEditor closeModal={jest.fn()} noteModel={noteModel} />,
    );
    const area = editable(container);

    fireEvent.click(screen.getByTitle('Insert Icon'));
    expect(screen.getByTestId('emoji-picker').getAttribute('data-theme')).toBe('light');
    expect(screen.getByTestId('emoji-picker').getAttribute('data-placeholder')).toBe(
      'Search emojis...',
    );

    execCommand.mockImplementation((command, _ui, value) => {
      if (command === 'insertText') {
        area.innerHTML += value ?? '';
      }
      return true;
    });
    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(execCommand).toHaveBeenCalledWith('insertText', false, '🎉 ');
    expect(document.activeElement).toBe(area);
    await waitFor(() => expect(screen.queryByTestId('emoji-picker')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(noteModel.setValue).toHaveBeenCalledWith('note🎉 ');
  });

  it('falls back to inserting the emoji by hand at the saved cursor position', () => {
    const noteModel = property<string | undefined>('ab');
    const { container } = renderPane(
      <RichTextNoteEditor closeModal={jest.fn()} noteModel={noteModel} />,
    );
    const area = editable(container);

    // Cursor between "a" and "b" when the picker opens.
    const range = document.createRange();
    range.setStart(area.firstChild as Node, 1);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    fireEvent.click(screen.getByTitle('Insert Icon'));
    // The browser refuses insertText, as some do inside contentEditable.
    execCommand.mockReturnValue(false);
    fireEvent.click(screen.getByRole('button', { name: 'pick party emoji' }));

    expect(area.textContent).toBe('a🎉 b');
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(noteModel.setValue).toHaveBeenCalledWith('a🎉 b');
  });

  it('closes the emoji picker without inserting anything when dismissed', async () => {
    const noteModel = property<string | undefined>('note');
    renderPane(<RichTextNoteEditor closeModal={jest.fn()} noteModel={noteModel} />);

    fireEvent.click(screen.getByTitle('Insert Icon'));
    fireEvent.keyDown(screen.getByTestId('emoji-picker'), { key: 'Escape' });

    await waitFor(() => expect(screen.queryByTestId('emoji-picker')).toBeNull());
    expect(execCommand).not.toHaveBeenCalled();
  });

  it('gives the emoji picker the dark theme in dark mode', () => {
    renderPane(<RichTextNoteEditor closeModal={jest.fn()} noteModel={note('x')} />, 'dark');

    fireEvent.click(screen.getByTitle('Insert Icon'));

    expect(screen.getByTestId('emoji-picker').getAttribute('data-theme')).toBe('dark');
  });

  it('focuses the note area shortly after opening', () => {
    jest.useFakeTimers();
    try {
      const { container } = renderPane(
        <RichTextNoteEditor closeModal={jest.fn()} noteModel={note('x')} />,
      );
      expect(document.activeElement).not.toBe(editable(container));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(document.activeElement).toBe(editable(container));
    } finally {
      jest.useRealTimers();
    }
  });

  it('jumps back into the note area on Ctrl+K / Cmd+K', () => {
    const { container } = renderPane(
      <RichTextNoteEditor closeModal={jest.fn()} noteModel={note('x')} />,
    );
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(document.activeElement).toBe(editable(container));

    outside.focus();
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(document.activeElement).toBe(editable(container));

    outside.focus();
    fireEvent.keyDown(document, { key: 'k' });
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it('keeps keystrokes typed in the note away from the map shortcuts', () => {
    const { container, unmount } = renderPane(
      <RichTextNoteEditor closeModal={jest.fn()} noteModel={note('x')} />,
    );
    const mapShortcuts = jest.fn();
    document.addEventListener('keydown', mapShortcuts);
    document.addEventListener('keyup', mapShortcuts);
    document.addEventListener('keypress', mapShortcuts);

    const area = editable(container);
    fireEvent.keyDown(area, { key: 'Delete' });
    fireEvent.keyUp(area, { key: 'Delete' });
    fireEvent.keyPress(area, { key: 'a', charCode: 97 });

    expect(mapShortcuts).not.toHaveBeenCalled();

    // Once the pane is gone, keys reach the map again.
    unmount();
    fireEvent.keyDown(document, { key: 'Delete' });
    expect(mapShortcuts).toHaveBeenCalledTimes(1);

    document.removeEventListener('keydown', mapShortcuts);
    document.removeEventListener('keyup', mapShortcuts);
    document.removeEventListener('keypress', mapShortcuts);
  });
});
