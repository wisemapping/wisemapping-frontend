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

import { describe, expect, test } from '@jest/globals';
import {
  htmlToPlainText,
  normalizeHtmlWhitespace,
} from '../../../src/components/import/support/HtmlText';

describe('htmlToPlainText', () => {
  test.each([
    ['collapses the source whitespace', '<p>  one\n   two  </p>', 'one two'],
    ['a line per paragraph', '<p>one</p>\n  <p>two</p>', 'one\ntwo'],
    ['keeps an empty paragraph as an empty line', '<p>one</p><p></p><p>two</p>', 'one\n\ntwo'],
    ['nested blocks are one line', '<div><div><p>one</p></div></div><p>two</p>', 'one\ntwo'],
    ['a line per list item', '<ul><li>one</li><li>two</li></ul>', 'one\ntwo'],
    ['breaks lines at <br>', 'one<br>two<br/>three', 'one\ntwo\nthree'],
    ['keeps the lines of preformatted text', '<pre>one\ntwo</pre>', 'one\ntwo'],
    ['inline markup is text', '<p>a <b>bold</b> <i>word</i></p>', 'a bold word'],
    ['skips the head and scripts', '<head><title>t</title></head><p>x<script>y</script></p>', 'x'],
    ['drops leading and trailing empty lines', '<p></p><p>one</p><br><p></p>', 'one'],
    ['decodes entities', '<p>Fish &amp; &lt;Chips&gt;</p>', 'Fish & <Chips>'],
  ])('%s', (_name: string, html: string, text: string) => {
    expect(htmlToPlainText(html)).toBe(text);
  });
});

describe('normalizeHtmlWhitespace', () => {
  test.each([
    ['collapses whitespace runs to a space', '<p>one \n\n  two</p>', '<p>one two</p>'],
    [
      'keeps the space between inline elements',
      '<p><b>a</b>\n\n<i>b</i></p>',
      '<p><b>a</b> <i>b</i></p>',
    ],
    ['drops the whitespace between blocks', '<p>a</p>\n\n<p>b</p>', '<p>a</p><p>b</p>'],
    [
      'drops the whitespace-only text at the edges of a block',
      '<p>\n<b>a</b>\n</p>',
      '<p><b>a</b></p>',
    ],
    ['keeps <br> and no-break spaces', '<p>a&nbsp;<br>\n b</p>', '<p>a&nbsp;<br> b</p>'],
    ['keeps preformatted text', '<pre>a\n  b</pre>', '<pre>a\n  b</pre>'],
  ])('%s', (_name: string, html: string, expected: string) => {
    expect(normalizeHtmlWhitespace(html)).toBe(expected);
  });
});
