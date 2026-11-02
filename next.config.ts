import type { NextConfig } from "next";
const config: NextConfig = { output: "export", distDir: process.env.NODE_ENV === "development" ? ".next-preview" : ".next", trailingSlash: true, poweredByHeader: false, experimental: { useTypeScriptCli: false }, images: { unoptimized: true } };
export default config;
