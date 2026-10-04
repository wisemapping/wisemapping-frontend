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

/* eslint-disable import/no-extraneous-dependencies */
import { describe, expect, jest, test } from '@jest/globals';
import SecureXmlParser from '../../../src/components/security/SecureXmlParser';

describe('SecureXmlParser', () => {
  test('keeps the predefined XML entities and character references', () => {
    const doc = SecureXmlParser.parseSecureXml(
      `<node TEXT="R&amp;D &lt;tag&gt; &quot;q&quot; &apos;a&apos;">caf&#233; &#x2713;</node>`,
    );

    expect(doc).not.toBeNull();
    expect(doc!.documentElement.getAttribute('TEXT')).toBe(`R&D <tag> "q" 'a'`);
    expect(doc!.documentElement.textContent).toBe('café ✓');
  });

  test('does not alter CDATA sections', () => {
    const cdata = 'a <!-- not a comment --> <?pi not a pi?> &amp; &custom;';
    const doc = SecureXmlParser.parseSecureXml(`<note><![CDATA[${cdata}]]></note>`);

    expect(doc).not.toBeNull();
    expect(doc!.documentElement.textContent).toBe(cdata);
  });

  test('removes comments and processing instructions', () => {
    const doc = SecureXmlParser.parseSecureXml(
      `<?xml version="1.0"?><?xml-stylesheet href="x.xsl"?><map><!-- comment --><node/></map>`,
    );

    expect(doc).not.toBeNull();
    expect(doc!.documentElement.childNodes).toHaveLength(1);
    expect(doc!.documentElement.firstElementChild!.tagName).toBe('node');
  });

  test('rejects documents declaring entities', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const xxe = `<?xml version="1.0"?>
<!DOCTYPE map [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<map><node TEXT="&xxe;"/></map>`;
    expect(SecureXmlParser.parseSecureXml(xxe)).toBeNull();

    const bomb = `<!DOCTYPE lolz [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;">]><lolz>&lol2;</lolz>`;
    expect(SecureXmlParser.parseSecureXml(bomb)).toBeNull();
  });

  test('ignores a DOCTYPE without entity declarations', () => {
    const doc = SecureXmlParser.parseSecureXml(
      `<!DOCTYPE map SYSTEM "map.dtd"><map><node TEXT="ok"/></map>`,
    );

    expect(doc).not.toBeNull();
    expect(doc!.documentElement.tagName).toBe('map');
  });

  test('drops references to undeclared entities', () => {
    const doc = SecureXmlParser.parseSecureXml(`<node>a&nbsp;b</node>`);

    expect(doc).not.toBeNull();
    expect(doc!.documentElement.textContent).toBe('ab');
  });

  test('isXmlContentSafe accepts the predefined XML entities', () => {
    expect(SecureXmlParser.isXmlContentSafe('<node TEXT="R&amp;D"/>')).toBe(true);
    expect(SecureXmlParser.isXmlContentSafe('<node TEXT="&xxe;"/>')).toBe(false);
  });
});
