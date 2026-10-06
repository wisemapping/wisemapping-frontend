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
import SecureXmlParser from '../../../src/components/security/SecureXmlParser';

/** The size, depth and pattern limits that keep an imported file from taking the page down. */
describe('SecureXmlParser limits', () => {
  let error: jest.SpyInstance;

  beforeEach(() => {
    error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const rejection = (): string => String((error.mock.calls[0]?.[1] as Error)?.message);

  it('rejects empty and non-string input', () => {
    expect(SecureXmlParser.parseSecureXml('')).toBeNull();
    expect(SecureXmlParser.parseSecureXml(undefined as unknown as string)).toBeNull();
    expect(rejection()).toBe('Invalid XML content');
  });

  it('rejects a document over 10 MB without parsing it', () => {
    const parse = jest.spyOn(DOMParser.prototype, 'parseFromString');
    const huge = `<a>${'x'.repeat(10 * 1024 * 1024)}</a>`;
    expect(SecureXmlParser.parseSecureXml(huge)).toBeNull();
    expect(rejection()).toBe('XML content too large');
    expect(parse).not.toHaveBeenCalled();
  });

  it('rejects an entity declaration outside a doctype', () => {
    expect(
      SecureXmlParser.parseSecureXml('<!ENTITY xxe SYSTEM "file:///etc/passwd"><a>&xxe;</a>'),
    ).toBeNull();
    expect(rejection()).toBe('XML entity declarations are not allowed');
  });

  it('rejects a doctype that declares entities', () => {
    const doc = SecureXmlParser.parseSecureXml(
      '<!DOCTYPE a [<!ENTITY a "x"><!ENTITY b "&a;&a;">]><a>&b;</a>',
    );
    expect(doc).toBeNull();
    expect(rejection()).toBe('XML entity declarations are not allowed');
  });

  it('drops the doctype, comments, processing instructions and unknown entity references', () => {
    const doc = SecureXmlParser.parseSecureXml(
      '<?xml version="1.0"?><!DOCTYPE map SYSTEM "x.dtd"><!-- note --><map>a&nbsp;b<?pi x?></map>',
    );
    expect(doc).not.toBeNull();
    expect(doc!.doctype).toBeNull();
    expect(doc!.documentElement.textContent).toBe('ab');
    expect(doc!.documentElement.childNodes).toHaveLength(1);
  });

  it('rejects malformed XML', () => {
    expect(SecureXmlParser.parseSecureXml('<a><b></a>')).toBeNull();
    expect(rejection()).toBe('XML parsing error');
  });

  it('rejects a document with too many elements before parsing it', () => {
    const parse = jest.spyOn(DOMParser.prototype, 'parseFromString');
    const many = `<a>${'<b/>'.repeat(200001)}</a>`;
    expect(SecureXmlParser.parseSecureXml(many)).toBeNull();
    expect(rejection()).toBe('Too many XML nodes');
    expect(parse).not.toHaveBeenCalled();
  });

  it('does not count markup inside CDATA as elements', () => {
    const cdata = `<![CDATA[${'<b>'.repeat(200001)}]]>`;
    expect(SecureXmlParser.parseSecureXml(`<a>${cdata}</a>`)).not.toBeNull();
  });

  it('accepts 100 levels of nesting, and rejects 101', () => {
    const nested = (depth: number) => `${'<a>'.repeat(depth + 1)}${'</a>'.repeat(depth + 1)}`;
    expect(SecureXmlParser.parseSecureXml(nested(100))).not.toBeNull();
    expect(SecureXmlParser.parseSecureXml(nested(101))).toBeNull();
    expect(rejection()).toBe('XML nesting too deep');
  });

  it('rejects an attribute over 10 KB', () => {
    expect(SecureXmlParser.parseSecureXml(`<a v="${'x'.repeat(10000)}"/>`)).not.toBeNull();
    expect(SecureXmlParser.parseSecureXml(`<a v="${'x'.repeat(10001)}"/>`)).toBeNull();
    expect(rejection()).toBe('Attribute value too long');
  });
});

describe('SecureXmlParser extraction helpers', () => {
  const element = (xml: string) => new DOMParser().parseFromString(xml, 'text/xml').documentElement;

  it('extracts text content, cut at 50 KB', () => {
    expect(SecureXmlParser.extractTextContent(element('<a>x<b>y</b></a>'))).toBe('xy');
    expect(SecureXmlParser.extractTextContent(element('<a/>'))).toBe('');
    expect(SecureXmlParser.extractTextContent(null as unknown as Element)).toBe('');
    const long = SecureXmlParser.extractTextContent(element(`<a>${'x'.repeat(50001)}</a>`));
    expect(long).toHaveLength(50000);
  });

  it('extracts an attribute value, cut at 10 KB', () => {
    const a = element(`<a v="value" long="${'x'.repeat(10001)}"/>`);
    expect(SecureXmlParser.extractAttributeValue(a, 'v')).toBe('value');
    expect(SecureXmlParser.extractAttributeValue(a, 'missing')).toBe('');
    expect(SecureXmlParser.extractAttributeValue(a, '')).toBe('');
    expect(SecureXmlParser.extractAttributeValue(null as unknown as Element, 'v')).toBe('');
    expect(SecureXmlParser.extractAttributeValue(a, 'long')).toHaveLength(10000);
  });
});

describe('SecureXmlParser.isXmlContentSafe', () => {
  it('accepts an ordinary map', () => {
    expect(
      SecureXmlParser.isXmlContentSafe('<map><topic text="R&amp;D"><![CDATA[note]]></topic></map>'),
    ).toBe(true);
  });

  it.each([
    ['empty input', ''],
    ['an entity declaration', '<!ENTITY x "y"><a/>'],
    ['a doctype declaring entities', '<!DOCTYPE a [<!ENTITY x "y">]><a/>'],
    ['an unknown entity reference', '<a>&x;</a>'],
    ['a stylesheet instruction', '<?xml-stylesheet href="x.xsl"?><a/>'],
    ['a script', '<a><script>alert(1)</script></a>'],
    ['an iframe', '<a><iframe src="x"></iframe></a>'],
    ['an object', '<a><object data="x"></object></a>'],
    ['an embed', '<a><embed src="x"/></a>'],
    ['a tag over 10 KB', `<a v="${'x'.repeat(10001)}"/>`],
    ['a CDATA section over 10 KB', `<a><![CDATA[${'x'.repeat(10001)}]]></a>`],
  ])('rejects %s', (_name, xml) => {
    expect(SecureXmlParser.isXmlContentSafe(xml)).toBe(false);
  });

  it('accepts a long tag that stays under 10 KB', () => {
    expect(SecureXmlParser.isXmlContentSafe(`<a v="${'x'.repeat(2000)}"/>`)).toBe(true);
  });
});
