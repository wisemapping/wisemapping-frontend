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

// Elements that start a line of their own.
const BLOCK_TAGS = new Set([
  'ADDRESS',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DL',
  'DT',
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
  'TABLE',
  'TR',
  'UL',
]);

const SKIPPED_TAGS = new Set(['HEAD', 'SCRIPT', 'STYLE', 'TEMPLATE']);

/**
 * The text of an html fragment, as a browser lays it out: the source whitespace is collapsed, and
 * paragraphs, list items and <br> are line breaks. An empty paragraph is kept as an empty line.
 * Topic texts are plain, so it is the text of the rich content of a node.
 */
export const htmlToPlainText = (html: string): string => {
  // An inert document: embedded markup (e.g. <img onerror>) never runs.
  const { body } = new DOMParser().parseFromString(html, 'text/html');
  const lines: string[] = [];
  let current = '';

  const walk = (node: Node, preformatted: boolean): void => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
        const text = child.textContent || '';
        if (preformatted) {
          const [first, ...rest] = text.split('\n');
          current += first;
          rest.forEach((line) => {
            lines.push(current);
            current = line;
          });
        } else {
          current += text.replace(/\s+/g, ' ');
        }
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      const tag = (child as Element).tagName.toUpperCase();
      if (SKIPPED_TAGS.has(tag)) {
        return;
      }
      if (tag === 'BR') {
        lines.push(current);
        current = '';
        return;
      }
      if (!BLOCK_TAGS.has(tag)) {
        walk(child, preformatted);
        return;
      }
      // A block ends the line before it. Whitespace between blocks is not a line.
      if (current.trim()) {
        lines.push(current);
      }
      current = '';
      const linesBefore = lines.length;
      walk(child, preformatted || tag === 'PRE');
      if (current.trim() || lines.length === linesBefore) {
        lines.push(current);
      }
      current = '';
    });
  };

  walk(body, false);
  if (current.trim()) {
    lines.push(current);
  }

  const result = lines.map((line) => line.replace(/[ \t]+/g, ' ').trim());
  while (result.length > 0 && !result[0]) {
    result.shift();
  }
  while (result.length > 0 && !result[result.length - 1]) {
    result.pop();
  }
  return result.join('\n');
};

export default htmlToPlainText;
