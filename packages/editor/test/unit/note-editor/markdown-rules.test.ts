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
  looksLikeMarkdown,
  markdownToHtml,
  matchBlockRule,
  matchInlineRule,
  safeLinkUrl,
} from '../../../src/components/action-widget/pane/rich-text-note-editor/markdown-rules';

describe('matchBlockRule', () => {
  test.each([
    ['- ', 'ul'],
    ['* ', 'ul'],
    ['+ ', 'ul'],
    ['-\u00a0', 'ul'],
    ['1. ', 'ol'],
    ['1) ', 'ol'],
    ['# ', 'h1'],
    ['## ', 'h2'],
    ['### ', 'h3'],
  ])('%j starts a %s', (text, type) => {
    expect(matchBlockRule(text)).toEqual({ type });
  });

  test.each(['-', 'a - ', ' - ', '2. ', '1.', '#### ', '#a ', '-- ', 'x'])(
    'leaves %j as text',
    (text) => {
      expect(matchBlockRule(text)).toBeNull();
    },
  );
});

describe('matchInlineRule', () => {
  test.each([
    ['**bold**', 'strong', 0, 'bold'],
    ['say __bold__', 'strong', 4, 'bold'],
    ['an *italic*', 'em', 3, 'italic'],
    ['_italic_', 'em', 0, 'italic'],
    ['(~~gone~~', 's', 1, 'gone'],
    ['run `npm i`', 'code', 4, 'npm i'],
    ['*a*', 'em', 0, 'a'],
    ['**two words**', 'strong', 0, 'two words'],
  ])('%j ends a %s span', (text, type, start, content) => {
    expect(matchInlineRule(text)).toEqual({ type, start, content });
  });

  test.each([
    'snake_case_',
    '2*3*',
    '* not *',
    '**bold*',
    '** spaced**',
    '**',
    '~single~',
    'plain text',
    '``',
  ])('leaves %j as text', (text) => {
    expect(matchInlineRule(text)).toBeNull();
  });

  test('turns a link with a web address into a link', () => {
    expect(matchInlineRule('see [the site](https://wisemapping.com/a?b=c)')).toEqual({
      type: 'a',
      start: 4,
      content: 'the site',
      href: 'https://wisemapping.com/a?b=c',
    });
  });

  test('takes a www address as https', () => {
    expect(matchInlineRule('[w](www.example.org)')?.href).toBe('https://www.example.org');
  });

  test.each([
    '[x](javascript:alert(1))',
    '[x](javascript:alert`1`)',
    '[x](JavaScript:alert)',
    '[x](data:text/html,hi)',
    '[x](vbscript:msgbox)',
    '[x](file:///etc/passwd)',
    '[x](/relative/path)',
    '[x](relative)',
    '![image](https://example.org/a.png)',
  ])('never makes a link of %j', (text) => {
    expect(matchInlineRule(text)).toBeNull();
  });
});

describe('safeLinkUrl', () => {
  test.each([
    ['https://example.org', 'https://example.org'],
    ['http://example.org/x', 'http://example.org/x'],
    ['mailto:someone@example.org', 'mailto:someone@example.org'],
    ['www.example.org', 'https://www.example.org'],
  ])('keeps %s', (url, expected) => {
    expect(safeLinkUrl(url)).toBe(expected);
  });

  test.each([
    'javascript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'jav&#x09;ascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:x',
    'ftp://example.org',
    'tel:123',
    '//example.org',
    'https://',
    'https://exa mple.org',
    'https://example.org/"onmouseover="x',
    'mailto:',
    '',
  ])('refuses %j', (url) => {
    expect(safeLinkUrl(url)).toBeNull();
  });
});

describe('markdownToHtml', () => {
  test('converts nested lists by indentation', () => {
    const md = ['- one', '  - one.a', '    - one.a.i', '- two', '\t1. two.1', '\t2. two.2'].join(
      '\n',
    );
    expect(markdownToHtml(md)).toBe(
      '<ul><li>one<ul><li>one.a<ul><li>one.a.i</li></ul></li></ul></li>' +
        '<li>two<ol><li>two.1</li><li>two.2</li></ol></li></ul>',
    );
  });

  test('starts a new list when the kind changes at the top level', () => {
    expect(markdownToHtml('- a\n1. b')).toBe('<ul><li>a</li></ul><ol><li>b</li></ol>');
  });

  test('converts headings, paragraphs and inline spans', () => {
    expect(
      markdownToHtml('# Title\n\nSome **bold**, *italic*, ~~old~~ and `code`\n### Small'),
    ).toBe(
      '<h1>Title</h1><div>Some <strong>bold</strong>, <em>italic</em>, <s>old</s> and ' +
        '<code>code</code></div><h3>Small</h3>',
    );
  });

  test('converts safe links and keeps unsafe ones as text', () => {
    expect(markdownToHtml('[ok](https://example.org) [bad](javascript:alert(1))')).toBe(
      '<div><a href="https://example.org">ok</a> [bad](javascript:alert(1))</div>',
    );
  });

  test('escapes markup in the text', () => {
    expect(markdownToHtml('- <img src=x onerror=alert(1)>')).toBe(
      '<ul><li>&lt;img src=x onerror=alert(1)&gt;</li></ul>',
    );
  });

  test('keeps fenced code as it is', () => {
    expect(markdownToHtml('```\n- not a list\n**x**\n```')).toBe('<pre>- not a list\n**x**</pre>');
  });

  test('produces markup the note sanitizer keeps unchanged', () => {
    const html = markdownToHtml(
      [
        '# Plan',
        '- **one** [link](https://example.org)',
        '    1. _nested_',
        '        - ~~deep~~ `x`',
        '- [bad](javascript:alert(1))',
      ].join('\n'),
    );
    expect(HtmlSanitizer.sanitize(html)).toBe(html);
    expect(html).not.toContain('href="javascript');
  });
});

describe('looksLikeMarkdown', () => {
  test.each(['- item', '1. one', '## Heading', 'some **bold**', '[a](https://x.org)', '```'])(
    'recognizes %j',
    (text) => {
      expect(looksLikeMarkdown(text)).toBe(true);
    },
  );

  test.each(['plain text', 'a - b', 'snake_case_name', '2*3*4', 'Price: $5\nTotal: $6'])(
    'leaves %j alone',
    (text) => {
      expect(looksLikeMarkdown(text)).toBe(false);
    },
  );
});
