/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  // Transpile Three.js packages for Next.js compatibility
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Security headers are set in middleware.ts
  poweredByHeader: false,
}

module.exports = nextConfig
