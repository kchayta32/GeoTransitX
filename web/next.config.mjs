/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    TYPHOON_API_KEY: process.env.TYPHOON_API_KEY || "sk-ZtLbj1CsBusuCbW0LPbNE2UWOJpqTKW9AIteX7bTzV9CaOTE",
  }
};

export default nextConfig;
