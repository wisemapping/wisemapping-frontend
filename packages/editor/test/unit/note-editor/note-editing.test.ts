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
import { HtmlSanitizer } from '@wisemapping/mindplot';
import {
  attachNoteEditing,
  NoteEditing,
} from '../../../src/components/action-widget/pane/rich-text-note-editor/note-editing';

let root: HTMLDivElement;
let editing: NoteEditing;
let onChange: jest.Mock;
let openLink: jest.Mock;

beforeEach(() => {
  root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.appendChild(root);
  onChange = jest.fn();
  openLink = jest.fn();
  editing = attachNoteEditing(root, { onChange, openLink });
});

afterEach(() => {
  editing.detach();
  document.body.innerHTML = '';
});

const caretAt = (node: Node, offset: number): void => {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
};

/** Puts the caret in the first text node holding the text, right before it (or after it). */
const caretIn = (text: string, after = false): void => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const index = n.textContent!.indexOf(text);
    if (index >= 0) {
      caretAt(n, after ? index + text.length : index);
      return;
    }
  }
  throw new Error(`no text ${text}`);
};

const caret = (): { node: Node; offset: number } => {
  const range = window.getSelection()!.getRangeAt(0);
  return { node: range.startContainer, offset: range.startOffset };
};

/**
 * Types like a browser does: beforeinput (which can be cancelled), the text inserted at the
 * caret, inside the element before it when the caret is right after one, then input.
 */
const type = (text: string): void => {
  text.split('').forEach((data) => {
    const before = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data,
      cancelable: true,
      bubbles: true,
    });
    if (!root.dispatchEvent(before)) {
      return;
    }
    const { node, offset } = caret();
    let textNode: Text;
    let at: number;
    if (node.nodeType === Node.TEXT_NODE) {
      textNode = node as Text;
      at = offset;
    } else {
      const previous = node.childNodes[offset - 1];
      const deepest = previous && (previous.lastChild ?? previous);
      if (deepest && deepest.nodeType === Node.TEXT_NODE) {
        textNode = deepest as Text;
        at = textNode.length;
      } else {
        if (node.childNodes.length === 1 && (node.firstChild as Element).tagName === 'BR') {
          node.removeChild(node.firstChild!);
        }
        textNode = document.createTextNode('');
        node.insertBefore(textNode, node.childNodes[offset] ?? null);
        at = 0;
      }
    }
    // A space typed at the end of a text is a non-breaking one.
    const typed = data === ' ' && at === textNode.length ? '\u00a0' : data;
    textNode.insertData(at, typed);
    caretAt(textNode, at + 1);
    root.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data, bubbles: true }));
  });
};

const key = (name: string, init: KeyboardEventInit = {}): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', {
    key: name,
    cancelable: true,
    bubbles: true,
    ...init,
  });
  root.dispatchEvent(event);
  return event;
};

const html = (): string => root.innerHTML.replace(/&nbsp;/g, ' ');

describe('Markdown typed at the start of a line', () => {
  test.each([
    ['- ', 'ul'],
    ['* ', 'ul'],
    ['+ ', 'ul'],
    ['1. ', 'ol'],
    ['1) ', 'ol'],
  ])('%j starts a %s list in an empty note', (marker, tag) => {
    caretAt(root, 0);
    type(`${marker}item`);
    expect(root.innerHTML).toBe(`<${tag}><li>item</li></${tag}>`);
    expect(onChange).toHaveBeenCalled();
  });

  test.each([
    ['# ', 'h1'],
    ['## ', 'h2'],
    ['### ', 'h3'],
  ])('%j starts a %s heading', (marker, tag) => {
    root.innerHTML = '<div>first</div><div><br></div>';
    caretAt(root.lastChild!, 0);
    type(`${marker}Title`);
    expect(root.innerHTML).toBe(`<div>first</div><${tag}>Title</${tag}>`);
  });

  test('converts a line typed straight in the note, up to its line break', () => {
    root.innerHTML = 'a<br>b';
    caretAt(root.lastChild!, 0);
    type('- ');
    expect(root.innerHTML).toBe('a<ul><li>b</li></ul>');
    expect(caret().node.textContent).toBe('b');
    expect(caret().offset).toBe(0);
  });

  test('keeps the text of the line after the marker in the item', () => {
    root.innerHTML = '<div>text</div>';
    caretIn('text');
    type('1. ');
    expect(root.innerHTML).toBe('<ol><li>text</li></ol>');
  });

  test('continues a list right above of the same kind', () => {
    root.innerHTML = '<ul><li>a</li></ul><div><br></div>';
    caretAt(root.lastChild!, 0);
    type('- b');
    expect(root.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  test.each(['a - ', '2. ', '#### ', '-x '])('leaves %j as text', (text) => {
    caretAt(root, 0);
    type(text);
    expect(html()).toBe(text);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('does not start a list inside a list item', () => {
    root.innerHTML = '<ul><li><br></li></ul>';
    caretAt(root.querySelector('li')!, 0);
    type('- ');
    expect(html()).toBe('<ul><li>- </li></ul>');
  });
});

describe('Markdown spans typed in a line', () => {
  test.each([
    ['**bold**', '<strong>bold</strong>'],
    ['__bold__', '<strong>bold</strong>'],
    ['*italic*', '<em>italic</em>'],
    ['_italic_', '<em>italic</em>'],
    ['~~old~~', '<s>old</s>'],
    ['`code`', '<code>code</code>'],
    ['[site](https://example.org/a)', '<a href="https://example.org/a">site</a>'],
    ['[site](www.example.org)', '<a href="https://www.example.org">site</a>'],
  ])('%j is converted as it is typed', (markdown, expected) => {
    root.innerHTML = '<div>say </div>';
    caretIn('say ', true);
    type(markdown);
    expect(html()).toBe(`<div>say ${expected}</div>`);
  });

  test('the text typed after a span is not part of it', () => {
    caretAt(root, 0);
    type('**bold** and *it* rest');
    expect(html()).toBe('<strong>bold</strong> and <em>it</em> rest');
  });

  test.each([
    ['at the end of the line', '', '<strong>b</strong>&nbsp;'],
    ['before a space', ' x', '<strong>b</strong>&nbsp; x'],
    ['before text', 'x', '<strong>b</strong> x'],
  ])('a space typed right after a span %s is kept visible', (_, after, expected) => {
    root.innerHTML = after;
    caretAt(root, 0);
    type('**b** ');
    expect(root.innerHTML).toBe(expected);
  });

  test.each([
    '[x](javascript:alert(1))',
    '[x](JaVaScRiPt:alert)',
    '[x](data:text/html,hi)',
    '[x](vbscript:msgbox)',
    '[x](/relative)',
  ])('never turns %j into a link', (markdown) => {
    caretAt(root, 0);
    type(markdown);
    expect(root.querySelector('a')).toBeNull();
    expect(root.textContent).toBe(markdown);
  });

  test('leaves the text inside code as it is', () => {
    root.innerHTML = '<code>a*b</code>';
    caretIn('a*b', true);
    type('*');
    expect(root.innerHTML).toBe('<code>a*b*</code>');
  });

  test('leaves intraword underscores and products alone', () => {
    caretAt(root, 0);
    type('snake_case_name 2*3*4');
    expect(html()).toBe('snake_case_name 2*3*4');
  });

  test('the produced markup passes the note sanitizer unchanged', () => {
    caretAt(root, 0);
    type('- **a** _b_ ~~c~~ `d` [e](https://example.org)');
    expect(root.querySelector('li')).not.toBeNull();
    expect(HtmlSanitizer.sanitize(root.innerHTML)).toBe(root.innerHTML);
  });
});

describe('Undo right after a conversion', () => {
  test('restores the typed list marker', () => {
    caretAt(root, 0);
    type('- ');
    expect(root.innerHTML).toBe('<ul><li><br></li></ul>');

    const undo = key('z', { ctrlKey: true });

    expect(undo.defaultPrevented).toBe(true);
    expect(html()).toBe('- ');
    expect(caret().offset).toBe(2);
    // Undo again is the browser's.
    expect(key('z', { ctrlKey: true }).defaultPrevented).toBe(false);
  });

  test('restores the literal span with Cmd+Z', () => {
    root.innerHTML = '<div>x </div>';
    caretIn('x ', true);
    type('**b**');

    expect(key('z', { metaKey: true }).defaultPrevented).toBe(true);
    expect(html()).toBe('<div>x **b**</div>');
  });

  test('is the browser undo once something else was typed', () => {
    caretAt(root, 0);
    type('**b**c');
    expect(key('z', { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(html()).toBe('<strong>b</strong>c');
  });
});

describe('Tab and Shift+Tab in lists', () => {
  test('Tab nests an item under the item above it', () => {
    root.innerHTML = '<ul><li>a</li><li>b</li></ul>';
    caretIn('b', true);

    const tab = key('Tab');

    expect(tab.defaultPrevented).toBe(true);
    expect(root.innerHTML).toBe('<ul><li>a<ul><li>b</li></ul></li></ul>');
    expect(caret().node.textContent).toBe('b');
    expect(caret().offset).toBe(1);
    expect(onChange).toHaveBeenCalled();
  });

  test('nests several levels, keeping the list kind', () => {
    root.innerHTML = '<ol><li>a</li><li>b</li><li>c</li></ol>';
    caretIn('b');
    key('Tab');
    caretIn('c');
    key('Tab');
    key('Tab');
    expect(root.innerHTML).toBe('<ol><li>a<ol><li>b<ol><li>c</li></ol></li></ol></li></ol>');
  });

  test('joins an existing sub-list of the item above', () => {
    root.innerHTML = '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>';
    caretIn('c');
    key('Tab');
    expect(root.innerHTML).toBe('<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>');
  });

  test('keeps the first item where it is, without leaving the editor', () => {
    root.innerHTML = '<ul><li>a</li></ul>';
    caretIn('a');
    expect(key('Tab').defaultPrevented).toBe(true);
    expect(root.innerHTML).toBe('<ul><li>a</li></ul>');
  });

  test('indents every selected item', () => {
    root.innerHTML = '<ul><li>a</li><li>b</li><li>c</li></ul>';
    const range = document.createRange();
    range.setStart(root.querySelectorAll('li')[1].firstChild!, 0);
    range.setEnd(root.querySelectorAll('li')[2].firstChild!, 1);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);

    key('Tab');

    expect(root.innerHTML).toBe('<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>');
    expect(window.getSelection()!.toString()).toBe('bc');
  });

  test('Shift+Tab moves an item up a level, the items after it becoming its children', () => {
    root.innerHTML = '<ul><li>a<ul><li>b</li><li>c</li></ul></li><li>d</li></ul>';
    caretIn('b');

    const tab = key('Tab', { shiftKey: true });

    expect(tab.defaultPrevented).toBe(true);
    expect(root.innerHTML).toBe('<ul><li>a</li><li>b<ul><li>c</li></ul></li><li>d</li></ul>');
    expect(caret().node.textContent).toBe('b');
  });

  test('Shift+Tab on a top level item turns it into a line', () => {
    root.innerHTML = '<ul><li>a</li><li>b<ul><li>b1</li></ul></li><li>c</li></ul>';
    caretIn('b');
    key('Tab', { shiftKey: true });
    expect(root.innerHTML).toBe('<ul><li>a</li></ul><div>b</div><ul><li>b1</li><li>c</li></ul>');
  });

  test('Shift+Tab handles a sub-list written next to the items', () => {
    root.innerHTML = '<ul><li>a</li><ul><li>b</li></ul></ul>';
    caretIn('b');
    key('Tab', { shiftKey: true });
    expect(root.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  test('Tab outside a list keeps moving the focus', () => {
    root.innerHTML = '<div>text</div>';
    caretIn('text');
    expect(key('Tab').defaultPrevented).toBe(false);
    expect(key('Tab', { shiftKey: true }).defaultPrevented).toBe(false);
    expect(root.innerHTML).toBe('<div>text</div>');
  });

  test('undo right after Tab puts the item back', () => {
    root.innerHTML = '<ul><li>a</li><li>b</li></ul>';
    caretIn('b');
    key('Tab');
    expect(key('z', { ctrlKey: true }).defaultPrevented).toBe(true);
    expect(root.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  test('the toolbar indents and outdents the selected item', () => {
    root.innerHTML = '<ul><li>a</li><li>b</li></ul>';
    caretIn('b');
    expect(editing.indent(false)).toBe(true);
    expect(root.innerHTML).toBe('<ul><li>a<ul><li>b</li></ul></li></ul>');
    expect(editing.indent(true)).toBe(true);
    expect(root.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  test('the toolbar does nothing outside a list', () => {
    root.innerHTML = '<div>a</div>';
    caretIn('a');
    expect(editing.indent(false)).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Enter and Shift+Enter in lists', () => {
  test('Enter in an item with text is the browser new item', () => {
    root.innerHTML = '<ul><li>a</li></ul>';
    caretIn('a', true);
    expect(key('Enter').defaultPrevented).toBe(false);
  });

  test('Enter on an empty top level item leaves the list', () => {
    root.innerHTML = '<ul><li>a</li><li><br></li></ul>';
    caretAt(root.querySelectorAll('li')[1], 0);

    expect(key('Enter').defaultPrevented).toBe(true);

    expect(root.innerHTML).toBe('<ul><li>a</li></ul><div><br></div>');
    expect(caret().node).toBe(root.lastChild);
  });

  test('Enter on an empty nested item moves it up one level', () => {
    root.innerHTML = '<ul><li>a<ul><li>b</li><li><br></li></ul></li></ul>';
    caretAt(root.querySelectorAll('li')[2], 0);

    expect(key('Enter').defaultPrevented).toBe(true);

    expect(root.innerHTML).toBe('<ul><li>a<ul><li>b</li></ul></li><li><br></li></ul>');
    expect(caret().node).toBe(root.querySelectorAll('li')[2]);
  });

  test('Shift+Enter breaks the line inside the item', () => {
    root.innerHTML = '<ul><li>abcd</li></ul>';
    caretAt(root.querySelector('li')!.firstChild!, 2);

    expect(key('Enter', { shiftKey: true }).defaultPrevented).toBe(true);

    expect(root.innerHTML).toBe('<ul><li>ab<br>cd</li></ul>');
    expect(root.querySelectorAll('li')).toHaveLength(1);
  });

  test('Shift+Enter at the end of an item leaves a visible empty line', () => {
    root.innerHTML = '<ul><li>ab</li></ul>';
    caretIn('ab', true);
    key('Enter', { shiftKey: true });
    expect(root.innerHTML).toBe('<ul><li>ab<br><br></li></ul>');
  });

  test('Shift+Enter outside a list is the browser one', () => {
    root.innerHTML = '<div>ab</div>';
    caretIn('ab', true);
    expect(key('Enter', { shiftKey: true }).defaultPrevented).toBe(false);
  });
});

describe('Links in the editor', () => {
  const click = (target: Element, init: MouseEventInit = {}): MouseEvent => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    root.innerHTML = '<div>see <a href="https://example.org/"><strong>site</strong></a></div>';
  });

  test('a plain click only places the caret', () => {
    const event = click(root.querySelector('strong')!);
    expect(event.defaultPrevented).toBe(false);
    expect(openLink).not.toHaveBeenCalled();
  });

  test.each([{ ctrlKey: true }, { metaKey: true }])('%j click opens the link', (init) => {
    const event = click(root.querySelector('strong')!, init);
    expect(event.defaultPrevented).toBe(true);
    expect(openLink).toHaveBeenCalledWith('https://example.org/');
  });

  test('never opens an unsafe link', () => {
    root.innerHTML = '<a href="javascript:alert(1)">x</a>';
    click(root.querySelector('a')!, { ctrlKey: true });
    expect(openLink).not.toHaveBeenCalled();
  });

  test('opens a link in a new tab without the opener by default', () => {
    editing.detach();
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    editing = attachNoteEditing(root, { onChange });

    click(root.querySelector('a')!, { ctrlKey: true });

    expect(open).toHaveBeenCalledWith('https://example.org/', '_blank', 'noopener,noreferrer');
    open.mockRestore();
  });
});

describe('Pasting Markdown', () => {
  const paste = (data: Record<string, string>): Event => {
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: (type: string) => data[type] ?? '' },
    });
    root.dispatchEvent(event);
    return event;
  };

  test('converts pasted Markdown text, nested lists included', () => {
    caretAt(root, 0);

    const event = paste({
      'text/plain': '- one\n  - **two** [x](https://example.org)\n- <b>three</b>',
    });

    expect(event.defaultPrevented).toBe(true);
    expect(root.innerHTML).toBe(
      '<ul><li>one<ul><li><strong>two</strong> <a href="https://example.org">x</a></li></ul>' +
        '</li><li>&lt;b&gt;three&lt;/b&gt;</li></ul>',
    );
    expect(onChange).toHaveBeenCalled();
  });

  test('never pastes an unsafe link', () => {
    caretAt(root, 0);
    paste({ 'text/plain': '- [x](javascript:alert(1))' });
    expect(root.querySelector('a')).toBeNull();
  });

  test('leaves plain text and rich content to the browser', () => {
    caretAt(root, 0);
    expect(paste({ 'text/plain': 'just text' }).defaultPrevented).toBe(false);
    expect(paste({ 'text/plain': '- a', 'text/html': '<b>a</b>' }).defaultPrevented).toBe(false);
  });
});

test('detach removes the behaviour', () => {
  editing.detach();
  root.innerHTML = '<ul><li>a</li><li>b</li></ul>';
  caretIn('b');
  expect(key('Tab').defaultPrevented).toBe(false);
  editing = attachNoteEditing(root, { onChange });
});
