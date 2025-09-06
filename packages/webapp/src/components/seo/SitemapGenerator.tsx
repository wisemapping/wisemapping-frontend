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
    publicMaps.forEach((map) => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/c/maps/${map.id}/public</loc>\n`;
      sitemap += `    <lastmod>${map.lastModified}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.6</priority>\n';
      sitemap += '  </url>\n';
    });

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
