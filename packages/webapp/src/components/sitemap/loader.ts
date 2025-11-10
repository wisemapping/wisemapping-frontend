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

import AppConfig from '../../classes/app-config';
import type { MapInfo } from '../../classes/client';

const BASE_URL = 'https://app.wisemapping.com';
const CURRENT_DATE = new Date().toISOString().split('T')[0];

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

/**
 * Generates XML sitemap content
 */
function generateSitemapXml(urls: SitemapUrl[]): string {
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
 * Formats date from ISO string to YYYY-MM-DD format
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    return CURRENT_DATE;
  }
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return CURRENT_DATE;
  }
}

/**
 * Checks if a map was created or modified within the last month
 */
function isWithinLastMonth(map: MapInfo): boolean {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // Check last modification time first, then creation time
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
 * Sitemap loader - fetches public maps and generates XML sitemap
 */
export async function sitemapLoader(): Promise<Response> {
  const urls: SitemapUrl[] = [];

  // Add static pages
  urls.push({
    loc: `${BASE_URL}/`,
    lastmod: CURRENT_DATE,
    changefreq: 'daily',
    priority: '1.0',
  });

  urls.push({
    loc: `${BASE_URL}/c/login`,
    lastmod: CURRENT_DATE,
    changefreq: 'monthly',
    priority: '0.8',
  });

  urls.push({
    loc: `${BASE_URL}/c/registration`,
    lastmod: CURRENT_DATE,
    changefreq: 'monthly',
    priority: '0.8',
  });

  // Try to fetch public maps (only if config is available)
  // Note: Sitemap route is outside configLoader, so config may not be loaded
  try {
    // Check if config is available before trying to get client
    AppConfig.fetchOrGetConfig();
    const client = AppConfig.getClient();
    const allMaps = await client.fetchAllMaps();
    const publicMaps = allMaps.filter((map) => map.public === true && isWithinLastMonth(map));

    // Add public maps to sitemap (only those from the last month)
    publicMaps.forEach((map: MapInfo) => {
      urls.push({
        loc: `${BASE_URL}/c/maps/${map.id}/public`,
        lastmod: formatDate(map.lastModificationTime),
        changefreq: 'weekly',
        priority: '0.6',
      });
    });
  } catch (error) {
    // If fetching maps fails (e.g., no config, no authentication), continue with static pages only
    // This is expected for public sitemap access
  }

  // Generate XML
  const xml = generateSitemapXml(urls);

  // Return XML response with proper headers
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
