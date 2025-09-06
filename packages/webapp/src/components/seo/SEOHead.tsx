import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
  noindex?: boolean;
  nofollow?: boolean;
  language?: string;
  alternateLanguages?: Array<{ hreflang: string; href: string }>;
}

const SEOHead: React.FC<SEOProps> = ({
  title = 'WiseMapping - Visual Thinking Evolution',
  description = 'WiseMapping is a free, fast and simple online mind mapping editor for individuals and business. Sign up to start organizing and sharing your ideas and thoughts.',
  keywords = 'mindmap,mind map,mind maps,mindmaps,ideas,brainstorming,organize,thoughts,structure,collaboration,free,fast,simple,online,tool,knowledge,share,sharing,publish',
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = '/logo.svg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData,
  noindex = false,
  nofollow = false,
  language = 'en',
  alternateLanguages = [],
}) => {
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.wisemapping.com';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
  const fullTwitterImage = twitterImage
    ? twitterImage.startsWith('http')
      ? twitterImage
      : `${baseUrl}${twitterImage}`
    : fullOgImage;

  const robotsContent: string[] = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent.join(', ')} />
      <meta name="author" content="WiseMapping" />
      <meta name="publisher" content="WiseMapping" />

      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={fullOgImage} />
      <meta
        property="og:url"
        content={fullCanonicalUrl || `${baseUrl}${window.location.pathname}`}
      />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="WiseMapping" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta
        name="twitter:description"
        content={twitterDescription || ogDescription || description}
      />
      <meta name="twitter:image" content={fullTwitterImage} />
      <meta name="twitter:site" content="@wisemapping" />
      <meta name="twitter:creator" content="@wisemapping" />

      {/* Language and Internationalization */}
      <html lang={language} />
      {alternateLanguages.map((alt, index) => (
        <link key={index} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="apple-mobile-web-app-title" content="WiseMapping" />
      <meta name="application-name" content="WiseMapping" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
