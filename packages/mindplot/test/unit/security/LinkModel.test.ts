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
import { describe, expect, it, test } from '@jest/globals';
import LinkModel from '../../../src/components/model/LinkModel';

const SAFE_SCHEMES = ['http:', 'https:', 'mailto:'];

/** The scheme a browser would resolve for this href, or null when it is not a valid URL. */
const schemeOf = (href: string): string | null => {
  try {
    return new URL(href).protocol;
  } catch {
    return null;
  }
};

describe('LinkModel url handling', () => {
  test.each([
    'javascript:alert(1)//http://x',
    'JavaScript:alert(document.cookie)//https://x',
    ' javascript:alert(1)',
    'java\tscript:alert(1)//http://',
    'vbscript:msgbox(1)//http://',
    'data:text/html,<script>alert(1)</script>//http://',
  ])('never stores a script-capable scheme for %p', (url) => {
    const model = new LinkModel({ url });
    const scheme = schemeOf(model.getUrl());
    // Either not a valid URL at all, or one of the allowed schemes.
    if (scheme !== null) {
      expect(SAFE_SCHEMES).toContain(scheme);
    }
    expect(model.getUrl().startsWith('http://')).toBe(true);
  });

  test.each(['http://www.digg.com', 'https://www.youtube.com/tv?vq=medium#/watch?v=rKxZwNKs9cE'])(
    'keeps %p untouched',
    (url) => {
      expect(new LinkModel({ url }).getUrl()).toBe(url);
    },
  );

  it('prefixes scheme-less urls with http://', () => {
    expect(new LinkModel({ url: 'www.wisemapping.com' }).getUrl()).toBe(
      'http://www.wisemapping.com',
    );
    expect(new LinkModel({ url: 'localhost:8080/maps' }).getUrl()).toBe(
      'http://localhost:8080/maps',
    );
  });

  it('keeps mailto: links as mail links without an http:// prefix', () => {
    const model = new LinkModel({ url: 'mailto:someone@wisemapping.com' });
    expect(model.getUrl()).toBe('mailto:someone@wisemapping.com');
    expect(model.getAttribute('urlType')).toBe('mail');
  });
});
