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
import { afterEach, describe, expect, it, test } from '@jest/globals';
import HtmlSanitizer from '../../../src/components/security/HtmlSanitizer';
import { IMG_ONERROR_PAYLOAD, installLiveParseProbe, installXssHook } from './LiveParseProbe';

const FORBIDDEN_TAGS = new Set(['script', 'iframe', 'svg', 'math', 'object', 'embed', 'style']);
const UNSAFE_URL = /^\s*(javascript|vbscript|data):/i;

/** Re-parses the sanitizer output inertly and lists every unsafe construct left in it. */
const findUnsafe = (html: string): string[] => {
  const doc = document.implementation.createHTMLDocument('');
  doc.body.innerHTML = html;
  const problems: string[] = [];
  doc.body.querySelectorAll('*').forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (FORBIDDEN_TAGS.has(tag)) {
      problems.push(`<${tag}>`);
    }
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on')) {
        problems.push(`${tag}[${name}]`);
      }
      if ((name === 'href' || name === 'src') && UNSAFE_URL.test(attr.value)) {
        problems.push(`${tag}[${name}=${attr.value}]`);
      }
    });
  });
  return problems;
};

const XSS_CORPUS = [
  '<font><img src=x onerror=alert(1)><a href="javascript:alert(1)">x</a></font>',
  '<custom><custom2><img src=x onerror=alert(1)></custom2></custom>',
  '<p><font><b><font><img src=x onerror=alert(1)></font></b></font></p>',
  '<table><tr><td><img src=x onerror=alert(1)></td></tr></table>',
  '<center><script>alert(1)</script></center>',
  '<section><iframe src="javascript:alert(1)"></iframe></section>',
  '<x><svg onload=alert(1)><circle /></svg></x>',
  '<abbr><a href=" JaVaScRiPt:alert(1)">x</a></abbr>',
  '<font><a href="data:text/html,<script>alert(1)</script>">x</a></font>',
  '<font><span onmouseover=alert(1)>x</span></font>',
  '<font><div style="background:url(javascript:alert(1))">x</div></font>',
  '<marquee onstart=alert(1)><img src=x onerror=alert(1)></marquee>',
  '<font><!-- <img src=x onerror=alert(1)> --></font>',
  '<img src=x onerror=alert(1)>',
  '<a href="javascript:alert(1)">x</a>',
  '<div onclick="alert(1)"><p onmouseover="alert(1)">x</p></div>',
];

describe('HtmlSanitizer.sanitize', () => {
  let restoreProbe: (() => void) | undefined;

  afterEach(() => {
    restoreProbe?.();
    restoreProbe = undefined;
  });

  test.each(XSS_CORPUS)('neutralizes %p', (vector) => {
    expect(findUnsafe(HtmlSanitizer.sanitize(vector))).toEqual([]);
  });

  it('sanitizes the children of a disallowed tag instead of passing them through', () => {
    const result = HtmlSanitizer.sanitize(
      '<font><img src=x onerror=alert(1)><a href="javascript:alert(1)">x</a></font>',
    );
    expect(result).not.toMatch(/onerror/i);
    expect(result).not.toMatch(/javascript:/i);
    // Text and allowed children survive.
    expect(result).toBe('<span><img src="x"><a>x</a></span>');
  });

  it('keeps allowed formatting intact', () => {
    const html =
      '<p class="a" style="color: red">Hello <strong>bold</strong> <a href="https://x.org" title="t">link</a></p>';
    expect(HtmlSanitizer.sanitize(html)).toBe(html);
  });

  it('does not run payloads while parsing the input', () => {
    const hook = installXssHook();
    restoreProbe = installLiveParseProbe();

    HtmlSanitizer.sanitize(`<p>${IMG_ONERROR_PAYLOAD}</p>`);
    HtmlSanitizer.sanitize(`<font>${IMG_ONERROR_PAYLOAD}</font>`);

    expect(hook).not.toHaveBeenCalled();
  });

  it('truncates content over 100 KB and still sanitizes it, instead of throwing', () => {
    const padding = 'a'.repeat(99_950);
    // The limit cuts the second image in the middle of its tag.
    const html = `<p>${padding}<img src=x onerror=alert(1)><img src=x onerror=alert(2)></p>${'b'.repeat(50_000)}`;

    const result = HtmlSanitizer.sanitize(html);

    expect(findUnsafe(result)).toEqual([]);
    expect(result.startsWith(`<p>${padding}<img src="x">`)).toBe(true);
    expect(result).not.toContain('b');
    expect(result.length).toBeLessThan(100_100);
  });

  it('does not split a surrogate pair when it truncates', () => {
    const html = `${'a'.repeat(99_999)}😀${'b'.repeat(10)}`;

    const result = HtmlSanitizer.sanitize(html);

    expect(result).toBe('a'.repeat(99_999));
  });
});
