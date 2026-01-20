/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora erros de TypeScript no build (Vercel)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignora erros de ESLint no build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
