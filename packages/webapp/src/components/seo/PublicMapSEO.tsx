import React from 'react';
import SEOHead from './SEOHead';
import { SEOProps } from './SEOHead';

interface PublicMapSEOProps extends Omit<SEOProps, 'title' | 'description' | 'keywords'> {
  mapTitle: string;
  mapDescription?: string;
  mapCreator?: string;
  mapId: string;
  mapUrl?: string;
}

const PublicMapSEO: React.FC<PublicMapSEOProps> = ({
  mapTitle,
  mapDescription,
  mapCreator,
  mapId,
  mapUrl,
  ...seoProps
}) => {
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.wisemapping.com';
  const fullMapUrl = mapUrl || `${baseUrl}/c/maps/${mapId}/public`;

  const title = `${mapTitle} | Public Mind Map | WiseMapping`;
  const description =
    mapDescription ||
    `Explore "${mapTitle}" - a public mind map created with WiseMapping. ${mapCreator ? `Created by ${mapCreator}. ` : ''}View and interact with this visual thinking tool online.`;
  const keywords = `public mind map, ${mapTitle}, visual thinking, brainstorming, ${mapCreator ? `${mapCreator}, ` : ''}collaboration, ideas, organization`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: mapTitle,
    description: description,
    url: fullMapUrl,
    author: mapCreator
      ? {
          '@type': 'Person',
          name: mapCreator,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'WiseMapping',
      url: 'https://www.wisemapping.com',
    },
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    isAccessibleForFree: true,
    inLanguage: 'en',
  };

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={`/c/maps/${mapId}/public`}
      ogType="article"
      ogTitle={title}
      ogDescription={description}
      ogImage={`${baseUrl}/api/maps/${mapId}/thumbnail`}
      twitterTitle={title}
      twitterDescription={description}
      twitterImage={`${baseUrl}/api/maps/${mapId}/thumbnail`}
      structuredData={structuredData}
      {...seoProps}
    />
  );
};

export default PublicMapSEO;
