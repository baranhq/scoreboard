import type { Metadata } from "next";
import { LandingDocument } from "@/components/content/landing-document";
import { landingMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = landingMetadata("en");

export default function Page() {
  return <LandingDocument lang="en" root />;
}
