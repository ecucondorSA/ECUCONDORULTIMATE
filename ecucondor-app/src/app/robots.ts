import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ecucondor.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/calculator',
          '/login', 
          '/register',
          '/dashboard',
          '/about',
          '/contact',
          '/sitemap.xml'
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '*.json',
          '/temp/',
          '/logs/',
          '/config/',
          '/backup/'
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/calculator', '/login', '/register'],
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/calculator'],
        disallow: ['/api/', '/admin/', '/dashboard/'],
        crawlDelay: 2,
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}