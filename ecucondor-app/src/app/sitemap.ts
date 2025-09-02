import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ecucondor.com';
  const currentDate = new Date();

  // Páginas estáticas principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Secciones de la landing page
    {
      url: `${baseUrl}/#about`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/#testimonials`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/#contacto`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    }
  ];

  // En el futuro, aquí podrías agregar rutas dinámicas
  // Por ejemplo, si tienes un blog o páginas de servicios
  /*
  const dynamicRoutes = await getDynamicRoutes();
  const blogPosts: MetadataRoute.Sitemap = dynamicRoutes.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
  */

  return [
    ...staticRoutes,
    // ...blogPosts, // Descomentar cuando tengas contenido dinámico
  ];
}

// Función helper para obtener rutas dinámicas (implementar según necesidad)
/*
async function getDynamicRoutes() {
  try {
    // Ejemplo: obtener posts del blog, servicios, etc.
    // const posts = await fetch('/api/posts').then(res => res.json());
    // return posts;
    return [];
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error);
    return [];
  }
}
*/