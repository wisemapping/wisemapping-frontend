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

import type { MapInfo } from '../../classes/client';

export type SitemapUrl = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

export type BuildSitemapOptions = {
  baseUrl?: string;
  sourceDate?: string;
};

const DEFAULT_BASE_URL = 'https://app.wisemapping.com';

const STATIC_PAGES = [
  {
    path: '/c/login',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/c/registration',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/c/forgot-password',
    changefreq: 'monthly',
    priority: '0.7',
  },
];

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generates XML sitemap content from a list of URLs
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach((url) => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${url.loc}</loc>\n`;
    sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
    sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${url.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';
  return sitemap;
}

/**
 * Returns the formatted date or today's date when invalid/undefined
 */
export function formatDate(dateString?: string): string {
  if (!dateString) {
    return getCurrentDate();
  }
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return getCurrentDate();
  }
}

/**
 * Returns true when a map was created or updated within the last month
 */
export function isWithinLastMonth(map: MapInfo): boolean {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const relevantDate = map.lastModificationTime || map.creationTime;
  if (!relevantDate) {
    return false;
  }

  try {
    const mapDate = new Date(relevantDate);
    return mapDate >= oneMonthAgo;
  } catch {
    return false;
  }
}

/**
 * Builds the static sitemap entries that are always present.
 */
export function buildStaticUrls(options: BuildSitemapOptions = {}): SitemapUrl[] {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const lastmod = options.sourceDate ?? getCurrentDate();

  return STATIC_PAGES.map((page) => ({
    loc: `${baseUrl}${page.path}`,
    lastmod,
    changefreq: page.changefreq,
    priority: page.priority,
  }));
}

/**
 * Converts public maps into sitemap entries.
 */
export function buildPublicMapUrls(maps: MapInfo[], baseUrl = DEFAULT_BASE_URL): SitemapUrl[] {
  return maps
    .filter((map) => map.public)
    .filter((map) => isWithinLastMonth(map))
    .map((map) => ({
      loc: `${baseUrl}/c/maps/${map.id}/public`,
      lastmod: formatDate(map.lastModificationTime),
      changefreq: 'weekly',
      priority: '0.6',
    }));
}

/**
 * Helper that combines static and public map urls into a single list.
 */
export function composeSitemapUrls(
  maps: MapInfo[] = [],
  options: BuildSitemapOptions = {},
): SitemapUrl[] {
  const urls = buildStaticUrls(options);
  if (maps.length > 0) {
    urls.push(...buildPublicMapUrls(maps, options.baseUrl));
  }
  return urls;
}
