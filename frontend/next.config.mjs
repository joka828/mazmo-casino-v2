/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.rawpixel.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
