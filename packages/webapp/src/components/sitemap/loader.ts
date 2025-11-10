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
import { buildPublicMapUrls, buildStaticUrls, generateSitemapXml } from './utils';

/**
 * Sitemap loader - fetches public maps and generates XML sitemap
 */
export async function sitemapLoader(): Promise<Response> {
  const baseUrl = resolveBaseUrl();
  const urls = buildStaticUrls({ baseUrl });

  // Try to fetch public maps (only if config is available)
  // Note: Sitemap route is outside configLoader, so config may not be loaded
  try {
    // Check if config is available before trying to get client
    AppConfig.fetchOrGetConfig();
    const client = AppConfig.getClient();
    const allMaps = await client.fetchAllMaps();
    urls.push(...buildPublicMapUrls(allMaps, baseUrl));
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

function resolveBaseUrl(): string {
  try {
    const uiBaseUrl = AppConfig.getUiBaseUrl();
    if (uiBaseUrl) {
      return uiBaseUrl;
    }
  } catch {
    // noop - fallback to origin or default below
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://app.wisemapping.com';
}
