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

import {
  buildPublicMapUrls,
  buildStaticUrls,
  composeSitemapUrls,
  formatDate,
  generateSitemapXml,
  getCurrentDate,
  isWithinLastMonth,
} from '../../../src/components/sitemap/utils';
import {
  getAlternateLanguageUrls,
  getCanonicalUrl,
  getLocaleFromPath,
  SUPPORTED_LOCALES,
} from '../../../src/utils/seo-locale';
import { MapInfo } from '../../../src/classes/client';

const NOW = new Date('2026-03-15T12:00:00Z');

const map = (overrides: Partial<MapInfo>): MapInfo => ({
  id: 1,
  starred: false,
  title: 'm',
  labels: [],
  createdBy: 'a',
  creationTime: '2026-03-01T00:00:00Z',
  lastModificationBy: 'a',
  lastModificationTime: '2026-03-10T08:00:00Z',
  description: '',
  public: true,
  role: 'owner',
  ...overrides,
});

describe('sitemap utils', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('getCurrentDate returns today as YYYY-MM-DD', () => {
    expect(getCurrentDate()).toBe('2026-03-15');
  });

  it('formatDate keeps the day of a valid date and uses today otherwise', () => {
    expect(formatDate('2025-12-31T23:00:00Z')).toBe('2025-12-31');
    expect(formatDate(undefined)).toBe('2026-03-15');
    expect(formatDate('not a date')).toBe('2026-03-15');
  });

  it('isWithinLastMonth looks at the last modification, then the creation time', () => {
    expect(isWithinLastMonth(map({ lastModificationTime: '2026-03-01T00:00:00Z' }))).toBe(true);
    expect(isWithinLastMonth(map({ lastModificationTime: '2026-01-01T00:00:00Z' }))).toBe(false);
    expect(
      isWithinLastMonth(map({ lastModificationTime: '', creationTime: '2026-03-14T00:00:00Z' })),
    ).toBe(true);
    expect(isWithinLastMonth(map({ lastModificationTime: '', creationTime: '' }))).toBe(false);
    expect(isWithinLastMonth(map({ lastModificationTime: 'garbage' }))).toBe(false);
  });

  it('buildStaticUrls lists each auth page plainly and in every locale, with alternates', () => {
    const urls = buildStaticUrls({ baseUrl: 'https://wm.test', sourceDate: '2026-01-01' });

    expect(urls).toHaveLength(3 * (1 + SUPPORTED_LOCALES.length));
    expect(urls[0]).toMatchObject({
      loc: 'https://wm.test/c/login',
      lastmod: '2026-01-01',
      changefreq: 'monthly',
      priority: '0.8',
    });
    expect(urls[0].alternates?.[0]).toEqual({
      hreflang: 'x-default',
      href: 'https://wm.test/c/login',
    });
    expect(urls[0].alternates).toContainEqual({
      hreflang: 'zh-CN',
      href: 'https://wm.test/zh-CN/c/login',
    });
    expect(urls.map((u) => u.loc)).toContain('https://wm.test/es/c/forgot-password');
    expect(urls.find((u) => u.loc.endsWith('/c/forgot-password'))?.priority).toBe('0.7');
  });

  it('buildStaticUrls defaults to the production host and today', () => {
    const [first] = buildStaticUrls();

    expect(first).toMatchObject({
      loc: 'https://app.wisemapping.com/c/login',
      lastmod: '2026-03-15',
    });
  });

  it('buildPublicMapUrls keeps recent public maps only', () => {
    const urls = buildPublicMapUrls(
      [
        map({ id: 1 }),
        map({ id: 2, public: false }),
        map({ id: 3, lastModificationTime: '2025-01-01T00:00:00Z' }),
      ],
      'https://wm.test',
    );

    expect(urls).toEqual([
      {
        loc: 'https://wm.test/c/maps/1/public',
        lastmod: '2026-03-10',
        changefreq: 'weekly',
        priority: '0.6',
      },
    ]);
    expect(buildPublicMapUrls([map({ id: 4 })])[0].loc).toBe(
      'https://app.wisemapping.com/c/maps/4/public',
    );
  });

  it('composeSitemapUrls appends the public maps to the static pages', () => {
    const staticCount = buildStaticUrls().length;

    expect(composeSitemapUrls()).toHaveLength(staticCount);
    const withMaps = composeSitemapUrls([map({ id: 9 })], { baseUrl: 'https://wm.test' });
    expect(withMaps).toHaveLength(staticCount + 1);
    expect(withMaps[withMaps.length - 1].loc).toBe('https://wm.test/c/maps/9/public');
  });

  it('generateSitemapXml escapes values and writes alternate links', () => {
    const xml = generateSitemapXml([
      {
        loc: 'https://wm.test/a?x=1&y="2"',
        lastmod: '2026-01-01',
        changefreq: 'daily',
        priority: '1.0',
        alternates: [{ hreflang: 'es', href: "https://wm.test/es/<a>'" }],
      },
      { loc: 'https://wm.test/b', lastmod: 'd', changefreq: 'c', priority: 'p', alternates: [] },
    ]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')).toBe(true);
    expect(xml).toContain('<loc>https://wm.test/a?x=1&amp;y=&quot;2&quot;</loc>');
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="es" href="https://wm.test/es/&lt;a&gt;&apos;" />',
    );
    expect(xml).toContain('<loc>https://wm.test/b</loc>');
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml.match(/xhtml:link/g)).toHaveLength(1);
    expect(xml.endsWith('</urlset>')).toBe(true);
  });
});

describe('seo-locale', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it.each([
    ['/es/c/login', 'es'],
    ['/zh-CN/c/registration', 'zh-CN'],
    ['/zh/c/login', 'zh'],
  ])('reads the locale of %s', (path, locale) => {
    window.history.pushState({}, '', path);

    expect(getLocaleFromPath()).toBe(locale);
  });

  it.each(['/c/login', '/xx/c/login', '/es/maps', '/'])('finds no locale in %s', (path) => {
    window.history.pushState({}, '', path);

    expect(getLocaleFromPath()).toBeNull();
  });

  it('uses the unlocalized path as canonical', () => {
    expect(getCanonicalUrl('/c/registration')).toBe('/c/registration');
  });

  it('lists x-default and every locale on the current origin', () => {
    const alternates = getAlternateLanguageUrls('/c/login');

    expect(alternates).toHaveLength(1 + SUPPORTED_LOCALES.length);
    expect(alternates[0]).toEqual({
      hreflang: 'x-default',
      href: `${window.location.origin}/c/login`,
    });
    expect(alternates).toContainEqual({
      hreflang: 'pt',
      href: `${window.location.origin}/pt/c/login`,
    });
    expect(alternates).toContainEqual({
      hreflang: 'zh-CN',
      href: `${window.location.origin}/zh-CN/c/login`,
    });
  });
});
