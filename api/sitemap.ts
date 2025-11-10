import { buildStaticUrls, generateSitemapXml } from '../packages/webapp/src/components/sitemap/utils';

type BasicRequest = {
  headers: Record<string, string | string[] | undefined>;
};

type BasicResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): BasicResponse;
  send(body: string): void;
};

const DEFAULT_BASE_URL = 'https://app.wisemapping.com';

export default async function handler(req: BasicRequest, res: BasicResponse) {
  const baseUrl = resolveBaseUrl(req);
  const urls = buildStaticUrls({ baseUrl });
  const xml = generateSitemapXml(urls);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(xml);
}

function resolveBaseUrl(req: BasicRequest): string {
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
