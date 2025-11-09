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

import React from 'react';

interface SitemapGeneratorProps {
  publicMaps?: Array<{
    id: string;
    title: string;
    lastModified: string;
  }>;
}

const SitemapGenerator: React.FC<SitemapGeneratorProps> = ({ publicMaps = [] }) => {
  const baseUrl = 'https://www.wisemapping.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages = [
    {
      url: '/',
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: '1.0',
    },
    {
      url: '/c/login',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: '0.8',
    },
    {
      url: '/c/registration',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: '0.8',
    },
  ];

  const generateSitemap = () => {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach((page) => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${page.lastModified}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changeFrequency}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    // Add public maps

    sitemap += '</urlset>';
    return sitemap;
  };

  return (
    <div style={{ display: 'none' }}>
      <pre>{generateSitemap()}</pre>
    </div>
  );
};

export default SitemapGenerator;
