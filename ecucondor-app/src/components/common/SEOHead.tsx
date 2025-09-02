'use client';

import { usePathname } from 'next/navigation';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'service';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noindex = false
}: SEOHeadProps) {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ecucondor.com';
  const currentUrl = `${baseUrl}${pathname}`;

  const defaultTitle = 'EcuCondor - Intercambio de Divisas | Tu aliado financiero';
  const defaultDescription = 'Plataforma FinTech líder para intercambio seguro de divisas entre USD, ARS y BRL. Tasas competitivas, transacciones rápidas y confianza garantizada.';
  const defaultImage = `${baseUrl}/og-image.jpg`;
  const defaultKeywords = [
    'intercambio divisas',
    'cambio moneda', 
    'USD ARS BRL',
    'fintech Ecuador',
    'transferencias internacionales'
  ];

  const finalTitle = title ? `${title} | EcuCondor` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = [...new Set([...keywords, ...defaultKeywords])];
  const finalImage = image || defaultImage;

  // Generar structured data específico para la página
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'service' ? 'FinancialService' : 'WebPage',
    '@id': currentUrl,
    name: finalTitle,
    description: finalDescription,
    url: currentUrl,
    image: finalImage,
    inLanguage: 'es-EC',
    isPartOf: {
      '@type': 'WebSite',
      name: 'EcuCondor',
      url: baseUrl
    },
    provider: {
      '@type': 'Organization',
      name: 'EcuCondor',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: [
        'https://twitter.com/ecucondor',
        'https://facebook.com/ecucondor',
        'https://instagram.com/ecucondor'
      ]
    },
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    ...(author && { author: { '@type': 'Person', name: author } })
  };

  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="EcuCondor" />
      <meta property="og:locale" content="es_EC" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ecucondor" />
      <meta name="twitter:creator" content="@ecucondor" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Article specific */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Additional SEO meta tags */}
      <meta name="theme-color" content="#FFD700" />
      <meta name="msapplication-TileColor" content="#FFD700" />
      <meta name="application-name" content="EcuCondor" />
      <meta name="apple-mobile-web-app-title" content="EcuCondor" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS prefetch for performance */}
      <link rel="dns-prefetch" href="//api.exchangerate-api.com" />
      <link rel="dns-prefetch" href="//wa.me" />
      
      {/* Alternative language versions */}
      <link rel="alternate" hrefLang="es-EC" href={`${baseUrl}${pathname}`} />
      <link rel="alternate" hrefLang="es-AR" href={`${baseUrl}/es-ar${pathname}`} />
      <link rel="alternate" hrefLang="pt-BR" href={`${baseUrl}/pt-br${pathname}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${pathname}`} />
    </>
  );
}