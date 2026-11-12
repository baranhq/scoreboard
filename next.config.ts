import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  distDir: process.env.NODE_ENV === "development" ? ".next-preview" : ".next",
  trailingSlash: true,
  poweredByHeader: false,
  allowedDevOrigins: ["10.0.0.209"],
  experimental: { useTypeScriptCli: false },
};
export default config;
