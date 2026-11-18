import type { NextConfig } from "next";
import { ClientLicensesPlugin } from "./scripts/client-licenses-plugin.mjs";
const config: NextConfig = {
  output: "export",
  distDir: process.env.NODE_ENV === "development" ? ".next-preview" : ".next",
  trailingSlash: true,
  poweredByHeader: false,
  allowedDevOrigins: ["10.0.0.209"],
  experimental: { useTypeScriptCli: false },
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) config.plugins.push(new ClientLicensesPlugin());
    return config;
  },
};
export default config;
