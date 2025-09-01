import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Resolver problemas con jsPDF y módulos de Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      canvas: false,
      encoding: false,
    };
    
    // Alias para evitar resolución de módulos problemáticos
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };

    return config;
  },
};

export default nextConfig;
