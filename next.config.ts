import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "langngheviet.com.vn" },
      { protocol: "https", hostname: "api.mastercms.org" },
    ],
    deviceSizes: [360, 480, 640, 768, 1024, 1200, 1600],
  },
  // Tránh đóng gói thư viện antd dư thừa
  transpilePackages: ["antd", "@ant-design/icons", "@ant-design/nextjs-registry"],
  experimental: {
    // Giới hạn số worker khi build tĩnh: mỗi worker mở một pool Prisma,
    // quá nhiều worker sẽ vượt max_connections của PostgreSQL
    cpus: 6,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/trang-chu", destination: "/", permanent: true }];
  },
};

export default nextConfig;
