/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@edupathai/api-client",
    "@edupathai/api-types",
    "@edupathai/auth",
    "@edupathai/config",
    "@edupathai/design-system",
    "@edupathai/ui",
  ],
};

export default nextConfig;