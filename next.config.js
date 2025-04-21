/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["@azure/storage-blob"],
};

export default nextConfig;

