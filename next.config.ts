/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev-palqar-bucket.s3.ap-south-1.amazonaws.com",
      },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
