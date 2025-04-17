import type { NextConfig } from "next"
import withPWA from "next-pwa"

const isDev = process.env.NODE_ENV === "development"

const nextConfig: NextConfig = {
  /* config options here */
}

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev
})(nextConfig)