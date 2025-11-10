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

import { buildStaticUrls, generateSitemapXml } from '../packages/webapp/src/components/sitemap/utils';

type VercelRequest = {
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  send(body: string): void;
};

const DEFAULT_BASE_URL = 'https://app.wisemapping.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const baseUrl = resolveBaseUrl(req);
  const urls = buildStaticUrls({ baseUrl });
  const xml = generateSitemapXml(urls);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(xml);
}

function resolveBaseUrl(req: VercelRequest): string {
  const headers = req.headers || {};
  const protoHeader = headers['x-forwarded-proto'];
  const hostHeader = headers['x-forwarded-host'] || headers['host'];

  const protocol = Array.isArray(protoHeader)
    ? protoHeader[0]
    : protoHeader || (hostHeader?.toString().includes('localhost') ? 'http' : 'https');

  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  if (host) {
    return `${protocol}://${host}`;
  }

  return DEFAULT_BASE_URL;
}
