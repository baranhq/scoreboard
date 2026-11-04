const configured = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const url = new URL(configured);
if (
  !["http:", "https:"].includes(url.protocol) ||
  url.pathname !== "/" ||
  url.search ||
  url.hash ||
  url.username ||
  url.password
)
  throw new Error("NEXT_PUBLIC_SITE_URL must be a domain origin, without a path or credentials.");
export const siteOrigin = url.origin;
export const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";

export const brand = "Baran's Scoreboard";
export const repo = "https://github.com/baranhq/scoreboard";
