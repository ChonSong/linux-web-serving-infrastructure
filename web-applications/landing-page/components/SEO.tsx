import React from 'react';
import { SEOData } from '../types';
import { SITE_METADATA } from '../content';

interface SEOProps extends SEOData {
  children?: React.ReactNode;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  children
}) => {
  const pageTitle = title ? `${title} | ${SITE_METADATA.author}` : SITE_METADATA.title;
  const pageDescription = description || SITE_METADATA.description;
  const pageKeywords = keywords ? keywords.join(', ') : SITE_METADATA.keywords.join(', ');
  const pageImage = ogImage || SITE_METADATA.ogImage;
  const pageUrl = canonical || SITE_METADATA.siteUrl;

  React.useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let tag: HTMLMetaElement | null = document.querySelector(
        property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      ) as HTMLMetaElement;

      if (!tag) {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }

      tag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', pageDescription);
    updateMetaTag('keywords', pageKeywords);
    updateMetaTag('author', SITE_METADATA.author);

    // Open Graph tags
    updateMetaTag('og:title', pageTitle, 'property');
    updateMetaTag('og:description', pageDescription, 'property');
    updateMetaTag('og:image', pageImage || '', 'property');
    updateMetaTag('og:url', pageUrl, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', SITE_METADATA.author, 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);
    updateMetaTag('twitter:image', pageImage || '');
    updateMetaTag('twitter:site', '@' + SITE_METADATA.author.toLowerCase().replace(' ', ''));

    // Canonical URL
    if (canonical) {
      let linkTag: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
      if (!linkTag) {
        linkTag = document.createElement('link');
        linkTag.setAttribute('rel', 'canonical');
        document.head.appendChild(linkTag);
      }
      linkTag.setAttribute('href', canonical);
    }

    // Structured data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: SITE_METADATA.author,
      url: SITE_METADATA.siteUrl,
      description: SITE_METADATA.description,
      sameAs: [
        'https://linkedin.com/in/seanosullivan',
        'https://github.com/ChonSong',
        'https://twitter.com/seanosullivan'
      ],
      jobTitle: 'Senior Full-Stack Developer',
      knowsAbout: SITE_METADATA.keywords,
      worksFor: {
        '@type': 'Organization',
        name: 'TechCorp Solutions'
      },
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'University of California, Berkeley'
      }
    };

    // Update or create structured data
    let structuredDataTag: HTMLScriptElement | null = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (!structuredDataTag) {
      structuredDataTag = document.createElement('script');
      structuredDataTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataTag);
    }
    structuredDataTag.textContent = JSON.stringify(structuredData);

    // Cleanup on unmount
    return () => {
      // Reset title to default
      document.title = SITE_METADATA.title;
    };
  }, [pageTitle, pageDescription, pageKeywords, pageImage, pageUrl, canonical]);

  return <>{children}</>;
};

// Hook for dynamic SEO updates
export const useSEO = (seoData: SEOData) => {
  React.useEffect(() => {
    const seo = new SEO(seoData);
    return () => {
      // Cleanup handled in SEO component
    };
  }, [seoData]);
};