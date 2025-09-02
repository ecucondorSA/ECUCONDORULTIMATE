import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ecucondor.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/calculator', '/login'],
      disallow: ['/api/', '/admin/', '/_next/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}