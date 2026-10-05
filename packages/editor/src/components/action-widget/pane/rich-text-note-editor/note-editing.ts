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
import { HtmlSanitizer } from '@wisemapping/mindplot';
import {
  BlockRule,
  InlineRule,
  looksLikeMarkdown,
  markdownToHtml,
  matchBlockRule,
  matchInlineRule,
  safeLinkUrl,
} from './markdown-rules';

/**
 * Editing behaviour of the note editor's contentEditable, on top of what the browser does:
 * Markdown typed or pasted is converted, Tab and Shift+Tab nest list items, Enter on an empty
 * item leaves the list (or one level of it), Shift+Enter breaks the line inside an item and
 * Ctrl/Cmd+click opens a link. The changes are made on the DOM, so they behave the same in every
 * browser; undo right after one of them restores the content as it was before it.
 */

const BLOCK_TAGS = new Set([
  'ADDRESS',
  'BLOCKQUOTE',
  'DIV',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR',
  'LI',
  'OL',
  'P',
  'PRE',
  'UL',
]);

const isElement = (node: Node | null): node is HTMLElement =>
  !!node && node.nodeType === Node.ELEMENT_NODE;

const isBlock = (node: Node | null): boolean => isElement(node) && BLOCK_TAGS.has(node.tagName);

const isList = (node: Node | null): node is HTMLUListElement | HTMLOListElement =>
  isElement(node) && (node.tagName === 'UL' || node.tagName === 'OL');

const isItem = (node: Node | null): node is HTMLLIElement =>
  isElement(node) && node.tagName === 'LI';

type Caret = { node: Node; offset: number };

/** The closest element, from the node up to the root (excluded), matching the predicate. */
const closest = (
  root: HTMLElement,
  node: Node | null,
  predicate: (el: HTMLElement) => boolean,
): HTMLElement | null => {
  for (let current = node; current && current !== root; current = current.parentNode) {
    if (isElement(current) && predicate(current)) {
      return current;
    }
  }
  return null;
};

const selectionIn = (root: HTMLElement): Selection | null => {
  const selection = root.ownerDocument.defaultView?.getSelection() ?? null;
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  return root.contains(range.startContainer) && root.contains(range.endContainer)
    ? selection
    : null;
};

const collapsedCaret = (root: HTMLElement): Caret | null => {
  const selection = selectionIn(root);
  if (!selection || !selection.isCollapsed) {
    return null;
  }
  const range = selection.getRangeAt(0);
  return { node: range.startContainer, offset: range.startOffset };
};

const setCaret = (root: HTMLElement, node: Node, offset: number): void => {
  const selection = root.ownerDocument.defaultView?.getSelection();
  if (!selection) {
    return;
  }
  const range = root.ownerDocument.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

/** The caret as child indexes from the root, so it can be found again in restored content. */
const caretPath = (root: HTMLElement, caret: Caret | null): number[] | null => {
  if (!caret || !root.contains(caret.node)) {
    return null;
  }
  const path = [caret.offset];
  for (let node = caret.node; node !== root; node = node.parentNode!) {
    path.unshift(Array.prototype.indexOf.call(node.parentNode!.childNodes, node));
  }
  return path;
};

const restoreCaret = (root: HTMLElement, path: number[] | null): void => {
  let node: Node = root;
  if (path) {
    for (const index of path.slice(0, -1)) {
      const child = node.childNodes[index];
      if (!child) {
        break;
      }
      node = child;
    }
  }
  const length =
    node.nodeType === Node.TEXT_NODE ? node.textContent!.length : node.childNodes.length;
  const offset = path && node !== root ? Math.min(path[path.length - 1], length) : length;
  setCaret(root, node, offset);
};

/**
 * The block holding a position: its closest block ancestor, or the root for the lines typed
 * directly in it.
 */
const blockOf = (root: HTMLElement, node: Node): HTMLElement =>
  closest(root, node, (el) => isBlock(el)) ?? root;

/**
 * The line holding the caret: the inline nodes of its block around it, up to a block or a <br>.
 */
const lineOf = (root: HTMLElement, caret: Caret): { block: HTMLElement; nodes: Node[] } => {
  const block = blockOf(root, caret.node);
  let child: Node | null;
  if (caret.node === block) {
    child = block.childNodes[caret.offset - 1] ?? block.childNodes[caret.offset] ?? null;
  } else {
    child = caret.node;
    while (child.parentNode !== block) {
      child = child.parentNode!;
    }
  }
  const inLine = (node: Node | null): node is Node =>
    !!node && !isBlock(node) && !(isElement(node) && node.tagName === 'BR');
  if (!inLine(child)) {
    return { block, nodes: [] };
  }
  const nodes: Node[] = [child];
  for (let n = child.previousSibling; inLine(n); n = n.previousSibling) {
    nodes.unshift(n);
  }
  for (let n = child.nextSibling; inLine(n); n = n.nextSibling) {
    nodes.push(n);
  }
  return { block, nodes };
};

const textBefore = (root: HTMLElement, nodes: Node[], caret: Caret): string => {
  if (nodes.length === 0) {
    return '';
  }
  const range = root.ownerDocument.createRange();
  range.setStartBefore(nodes[0]);
  range.setEnd(caret.node, caret.offset);
  return range.toString();
};

/** The DOM position of a text offset in the line. */
const positionAt = (nodes: Node[], offset: number): Caret | null => {
  let remaining = offset;
  for (const top of nodes) {
    const walker = top.ownerDocument!.createTreeWalker(top, NodeFilter.SHOW_TEXT);
    for (let text = top.nodeType === Node.TEXT_NODE ? top : walker.nextNode(); text;) {
      const length = text.textContent!.length;
      if (remaining <= length) {
        return { node: text, offset: remaining };
      }
      remaining -= length;
      text = top.nodeType === Node.TEXT_NODE ? null : walker.nextNode();
    }
  }
  return null;
};

const isInsideCode = (root: HTMLElement, node: Node): boolean =>
  !!closest(root, node, (el) => ['CODE', 'PRE', 'A'].includes(el.tagName));

/** True when the item has no text of its own (its sub-lists aside). */
const isEmptyItem = (li: HTMLElement): boolean =>
  Array.from(li.childNodes).every(
    (child) =>
      isList(child) ||
      (!(isElement(child) && child.querySelector('img')) &&
        !(isElement(child) && child.tagName === 'IMG') &&
        (child.textContent ?? '').replace(/[\s\u00a0\u200b]/g, '') === ''),
  );

/** Appends a <br> to an element left without content, so the browser can place the caret in it. */
const fillEmpty = (el: HTMLElement): void => {
  if ((el.textContent ?? '') === '' && !el.querySelector('br, img')) {
    el.appendChild(el.ownerDocument.createElement('br'));
  }
};

/** Converts the caret's line to a list or a heading, removing the marker typed at its start. */
const applyBlockRule = (root: HTMLElement, caret: Caret, rule: BlockRule): boolean => {
  const { block, nodes } = lineOf(root, caret);
  if (nodes.length === 0) {
    return false;
  }
  // Only a whole line of the root or a whole paragraph is converted, not part of a list item or
  // of a heading.
  const blockChildren = Array.from(block.childNodes).filter(
    (n) => !(isElement(n) && n.tagName === 'BR' && n === block.lastChild),
  );
  const wholeBlock = blockChildren.every((n) => nodes.includes(n));
  if (block !== root && !(['DIV', 'P'].includes(block.tagName) && wholeBlock)) {
    return false;
  }

  const doc = root.ownerDocument;
  const marker = doc.createRange();
  marker.setStartBefore(nodes[0]);
  marker.setEnd(caret.node, caret.offset);
  marker.deleteContents();

  const isListRule = rule.type === 'ul' || rule.type === 'ol';
  const target = doc.createElement(isListRule ? 'li' : rule.type);
  const remaining = nodes.filter((n) => n.parentNode === block);
  const anchor = remaining.length > 0 ? remaining[0] : null;
  // The <br> around a line of the root are not needed next to a block.
  if (block === root && remaining.length > 0) {
    [remaining[0].previousSibling, remaining[remaining.length - 1].nextSibling].forEach((n) => {
      if (isElement(n) && n.tagName === 'BR') {
        n.remove();
      }
    });
  }
  const outer = isListRule ? doc.createElement(rule.type) : target;
  if (isListRule) {
    outer.appendChild(target);
  }

  if (block === root) {
    const reference = anchor ?? marker.startContainer.childNodes[marker.startOffset] ?? null;
    root.insertBefore(outer, reference && reference.parentNode === root ? reference : null);
  } else {
    block.parentNode!.replaceChild(outer, block);
  }
  remaining.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && n.textContent === '') {
      n.parentNode?.removeChild(n);
    } else {
      target.appendChild(n);
    }
  });
  fillEmpty(target);

  // A list right after another of the same kind continues it.
  const previous = outer.previousElementSibling;
  if (isListRule && previous && previous.tagName === outer.tagName) {
    previous.appendChild(target);
    outer.remove();
  }

  const first = target.firstChild;
  if (first && first.nodeType === Node.TEXT_NODE) {
    setCaret(root, first, 0);
  } else {
    setCaret(root, target, 0);
  }
  return true;
};

/** Replaces the span the rule matched, ending at the caret, with its element. */
const applyInlineRule = (root: HTMLElement, caret: Caret, rule: InlineRule): HTMLElement | null => {
  const { nodes } = lineOf(root, caret);
  const text = textBefore(root, nodes, caret);
  const start = positionAt(nodes, rule.start);
  if (!start) {
    return null;
  }
  const doc = root.ownerDocument;
  const span = doc.createRange();
  span.setStart(start.node, start.offset);
  span.setEnd(caret.node, caret.offset);
  if (span.toString() !== text.slice(rule.start)) {
    return null;
  }
  span.deleteContents();

  const element = doc.createElement(rule.type);
  element.textContent = rule.content;
  if (rule.href) {
    element.setAttribute('href', rule.href);
  }
  span.insertNode(element);
  // insertNode can leave empty text nodes around the element.
  [element.previousSibling, element.nextSibling].forEach((n) => {
    if (n && n.nodeType === Node.TEXT_NODE && n.textContent === '') {
      n.parentNode!.removeChild(n);
    }
  });

  const next = element.nextSibling;
  if (next && next.nodeType === Node.TEXT_NODE) {
    setCaret(root, next, 0);
  } else {
    setCaret(
      root,
      element.parentNode!,
      Array.prototype.indexOf.call(element.parentNode!.childNodes, element) + 1,
    );
  }
  return element;
};

/** True when the caret is right after the element, inside it or not. */
const isCaretAtEnd = (root: HTMLElement, caret: Caret, element: HTMLElement): boolean => {
  if (!element.isConnected || !root.contains(element)) {
    return false;
  }
  if (element.contains(caret.node)) {
    const rest = root.ownerDocument.createRange();
    rest.setStart(caret.node, caret.offset);
    rest.setEndAfter(element);
    return rest.toString() === '';
  }
  const parent = element.parentNode!;
  const index = Array.prototype.indexOf.call(parent.childNodes, element);
  return (
    (caret.node === parent && caret.offset === index + 1) ||
    (caret.node === element.nextSibling && caret.offset === 0)
  );
};

/** The sibling items from the one holding the selection start to the one holding its end. */
const selectedItems = (root: HTMLElement): HTMLLIElement[] => {
  const selection = selectionIn(root);
  if (!selection) {
    return [];
  }
  const range = selection.getRangeAt(0);
  const first = closest(root, range.startContainer, isItem) as HTMLLIElement | null;
  if (!first) {
    return [];
  }
  const items = [first];
  const last = closest(root, range.endContainer, isItem);
  if (last && last !== first && last.parentNode === first.parentNode) {
    for (let n = first.nextElementSibling; n; n = n.nextElementSibling) {
      if (isItem(n)) {
        items.push(n);
      }
      if (n === last) {
        break;
      }
    }
  }
  return items;
};

/** Makes the item a child of the item above it, in a sub-list of the same kind. */
const indentItem = (li: HTMLLIElement): boolean => {
  const list = li.parentElement;
  const previous = li.previousElementSibling;
  if (!list || !isList(list) || !previous) {
    return false;
  }
  if (isList(previous)) {
    // A sub-list written next to the items, as some editors do.
    previous.appendChild(li);
    return true;
  }
  let sublist = previous.lastElementChild;
  if (!isList(sublist)) {
    sublist = li.ownerDocument.createElement(list.tagName.toLowerCase()) as HTMLUListElement;
    previous.appendChild(sublist);
  }
  sublist.appendChild(li);
  return true;
};

/** Moves the items after this one, in its list, to a sub-list of it. */
const adoptFollowing = (li: HTMLLIElement, list: HTMLElement): void => {
  if (!li.nextSibling) {
    return;
  }
  let sublist = li.lastElementChild;
  if (!isList(sublist) || sublist.tagName !== list.tagName) {
    sublist = li.ownerDocument.createElement(list.tagName.toLowerCase()) as HTMLUListElement;
    li.appendChild(sublist);
  }
  while (li.nextSibling) {
    sublist.appendChild(li.nextSibling);
  }
};

/**
 * Moves a nested item one level up, after its parent item, keeping the items that followed it as
 * its children. An item of a top level list leaves it and becomes a line.
 */
const outdentItem = (root: HTMLElement, li: HTMLLIElement): HTMLElement | null => {
  const list = li.parentElement;
  if (!list || !isList(list)) {
    return null;
  }
  const holder = list.parentElement;
  if (holder && holder !== root && (isItem(holder) || isList(holder))) {
    adoptFollowing(li, list);
    // After the parent item, or after the sub-list when it is written next to the items.
    const previous = isItem(holder) ? holder : list;
    previous.parentNode!.insertBefore(li, previous.nextSibling);
    if (!list.firstElementChild) {
      list.remove();
    }
    return li;
  }

  // Leave the list: the item's text becomes a line, its sub-items and the items after it stay
  // in a list below that line.
  const doc = li.ownerDocument;
  const line = doc.createElement('div');
  const after = doc.createElement(list.tagName.toLowerCase());
  Array.from(li.childNodes).forEach((child) => {
    if (isList(child)) {
      Array.from(child.children).forEach((item) => after.appendChild(item));
    } else {
      line.appendChild(child);
    }
  });
  while (li.nextSibling) {
    after.appendChild(li.nextSibling);
  }
  li.remove();
  fillEmpty(line);
  list.parentNode!.insertBefore(line, list.nextSibling);
  if (after.firstChild) {
    line.parentNode!.insertBefore(after, line.nextSibling);
  }
  if (!list.firstElementChild) {
    list.remove();
  }
  return line;
};

/** Inserts a line break at the caret. */
const insertLineBreak = (root: HTMLElement): boolean => {
  const doc = root.ownerDocument;
  try {
    if (typeof doc.execCommand === 'function' && doc.execCommand('insertLineBreak')) {
      return true;
    }
  } catch {
    // Not supported: inserted below.
  }
  const selection = selectionIn(root);
  if (!selection) {
    return false;
  }
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const br = doc.createElement('br');
  range.insertNode(br);
  // A <br> ending a block is not shown as a line: another one makes the new line visible.
  const next = br.nextSibling;
  const atEnd =
    !next ||
    isBlock(next) ||
    (next.nodeType === Node.TEXT_NODE && next.textContent === '' && !next.nextSibling);
  if (atEnd) {
    br.parentNode!.insertBefore(doc.createElement('br'), br.nextSibling);
  }
  const parent = br.parentNode!;
  setCaret(root, parent, Array.prototype.indexOf.call(parent.childNodes, br) + 1);
  return true;
};

/** Inserts sanitized markup at the selection. */
const insertHtml = (root: HTMLElement, html: string): boolean => {
  const doc = root.ownerDocument;
  try {
    if (typeof doc.execCommand === 'function' && doc.execCommand('insertHTML', false, html)) {
      return true;
    }
  } catch {
    // Not supported: inserted below.
  }
  const selection = selectionIn(root);
  if (!selection) {
    return false;
  }
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  const last = fragment.lastChild;
  range.insertNode(fragment);
  if (last) {
    const parent = last.parentNode!;
    setCaret(root, parent, Array.prototype.indexOf.call(parent.childNodes, last) + 1);
  }
  return true;
};

const openInNewTab = (href: string): void => {
  window.open(href, '_blank', 'noopener,noreferrer');
};

export type NoteEditingOptions = {
  /** Called after the content was changed by one of the behaviours. */
  onChange: () => void;
  /** Opens a link, in a new tab by default. */
  openLink?: (href: string) => void;
};

type Snapshot = { html: string; caret: number[] | null };

const INLINE_TRIGGERS = new Set(['*', '_', '~', '`', ')']);

/**
 * Adds the editing behaviour to a contentEditable element.
 */
export type NoteEditing = {
  /** Removes the behaviour from the element. */
  detach: () => void;
  /** Indents, or outdents, the list items holding the selection. */
  indent: (outdent: boolean) => boolean;
};

export const attachNoteEditing = (root: HTMLElement, options: NoteEditingOptions): NoteEditing => {
  const openLink = options.openLink ?? openInNewTab;
  // The content before and after the last change made here, for undo.
  let last: { before: Snapshot; after: string } | null = null;
  // An element a typed span just became: the next character typed at its end goes after it.
  let exitElement: HTMLElement | null = null;

  const change = (apply: () => boolean): boolean => {
    const before: Snapshot = { html: root.innerHTML, caret: caretPath(root, collapsedCaret(root)) };
    if (!apply()) {
      return false;
    }
    last = { before, after: root.innerHTML };
    options.onChange();
    return true;
  };

  const undo = (): boolean => {
    if (!last || last.after !== root.innerHTML) {
      return false;
    }
    root.innerHTML = last.before.html;
    restoreCaret(root, last.before.caret);
    last = null;
    exitElement = null;
    options.onChange();
    return true;
  };

  const indent = (outdent: boolean): boolean =>
    change(() => {
      const items = selectedItems(root);
      const range = selectionIn(root)?.getRangeAt(0);
      // Moving nodes collapses the selection: it is put back where it was afterwards.
      const saved = range && {
        start: { node: range.startContainer, offset: range.startOffset },
        end: { node: range.endContainer, offset: range.endOffset },
      };
      const changed = outdent
        ? items.map((li) => !!outdentItem(root, li)).some(Boolean)
        : items.map((li) => indentItem(li)).some(Boolean);
      if (saved && saved.start.node.isConnected && saved.end.node.isConnected) {
        const selection = root.ownerDocument.defaultView!.getSelection()!;
        const restored = root.ownerDocument.createRange();
        restored.setStart(saved.start.node, saved.start.offset);
        restored.setEnd(saved.end.node, saved.end.offset);
        selection.removeAllRanges();
        selection.addRange(restored);
      }
      return changed;
    });

  const onInput = (event: Event): void => {
    const input = event as InputEvent;
    exitElement = null;
    if (input.inputType && input.inputType !== 'insertText') {
      return;
    }
    const caret = collapsedCaret(root);
    if (!caret || isInsideCode(root, caret.node)) {
      return;
    }
    const text = textBefore(root, lineOf(root, caret).nodes, caret);
    const typed = text.slice(-1);
    if (typed === ' ' || typed === '\u00a0') {
      const rule = matchBlockRule(text);
      if (rule) {
        change(() => applyBlockRule(root, caret, rule));
      }
    } else if (INLINE_TRIGGERS.has(typed)) {
      const rule = matchInlineRule(text);
      if (rule) {
        change(() => {
          exitElement = applyInlineRule(root, caret, rule);
          return !!exitElement;
        });
      }
    }
  };

  const onBeforeInput = (event: Event): void => {
    const input = event as InputEvent;
    const element = exitElement;
    exitElement = null;
    if (!element || input.inputType !== 'insertText' || !input.data) {
      return;
    }
    const caret = collapsedCaret(root);
    if (!caret || !isCaretAtEnd(root, caret, element)) {
      return;
    }
    // Browsers keep typing inside the element the caret is at the end of: write after it.
    event.preventDefault();
    const next = element.nextSibling;
    if (next && next.nodeType === Node.TEXT_NODE) {
      (next as Text).insertData(0, input.data);
      setCaret(root, next, input.data.length);
    } else {
      const text = root.ownerDocument.createTextNode(input.data);
      element.parentNode!.insertBefore(text, next);
      setCaret(root, text, input.data.length);
    }
    options.onChange();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.isComposing || event.altKey) {
      return;
    }
    const mod = event.ctrlKey || event.metaKey;
    if (mod && !event.shiftKey && event.key.toLowerCase() === 'z') {
      if (undo()) {
        event.preventDefault();
      }
      return;
    }
    if (mod) {
      return;
    }

    if (event.key === 'Tab') {
      if (selectedItems(root).length === 0) {
        // Outside a list Tab keeps moving the focus.
        return;
      }
      event.preventDefault();
      indent(event.shiftKey);
      return;
    }

    if (event.key === 'Enter') {
      const caret = collapsedCaret(root);
      const li = caret ? (closest(root, caret.node, isItem) as HTMLLIElement | null) : null;
      if (!li || !caret) {
        return;
      }
      if (event.shiftKey) {
        event.preventDefault();
        change(() => insertLineBreak(root));
        return;
      }
      if (isEmptyItem(li)) {
        event.preventDefault();
        change(() => {
          const moved = outdentItem(root, li);
          if (moved) {
            setCaret(root, moved, 0);
          }
          return !!moved;
        });
      }
    }
  };

  const onPaste = (event: ClipboardEvent): void => {
    const data = event.clipboardData;
    if (!data || data.getData('text/html')) {
      return;
    }
    const text = data.getData('text/plain');
    if (!text || !looksLikeMarkdown(text)) {
      return;
    }
    event.preventDefault();
    const html = HtmlSanitizer.sanitize(markdownToHtml(text));
    change(() => insertHtml(root, html));
  };

  const onClick = (event: MouseEvent): void => {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }
    const link = closest(root, event.target as Node, (el) => el.tagName === 'A');
    if (!link) {
      return;
    }
    event.preventDefault();
    // Only web and mail addresses are opened.
    const href = safeLinkUrl(link.getAttribute('href') ?? '');
    if (href) {
      openLink(href);
    }
  };

  root.addEventListener('input', onInput);
  root.addEventListener('beforeinput', onBeforeInput);
  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('paste', onPaste);
  root.addEventListener('click', onClick);
  return {
    detach: () => {
      root.removeEventListener('input', onInput);
      root.removeEventListener('beforeinput', onBeforeInput);
      root.removeEventListener('keydown', onKeyDown);
      root.removeEventListener('paste', onPaste);
      root.removeEventListener('click', onClick);
    },
    indent,
  };
};
