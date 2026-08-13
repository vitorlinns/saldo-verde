const nextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/contato',
        destination: '/contact'
      },
      {
        source: '/sobre-nos',
        destination: '/about'
      }
    ];
  }
};

export default nextConfig;
