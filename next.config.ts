import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/guias/instalacion/guia-instalacion-turbo-garantia",
        destination: "/guias/instalacion/como-instalar-un-turbo",
        permanent: true,
      },
      {
        // slug antiguo con tilde: daba 404
        source: "/guias/problemas/frenos-chirr%C3%ADan-pastillas-o-discos",
        destination: "/guias/problemas/frenos-chirrian-pastillas-o-discos",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
