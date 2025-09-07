/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Tắt telemetry
  telemetry: false,
  images: {
    domains: [
      'media-blog.jobsgo.vn',
      'thanhnien.vn',
      'images2.thanhnien.vn',
      'res.cloudinary.com',
      'images.unsplash.com',
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // Bỏ qua lỗi TypeScript
  },
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua lỗi ESLint
  },
  // Tắt một số cảnh báo không cần thiết
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Bỏ qua lỗi về module không tìm thấy
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
