import type { Metadata } from "next";

import { privacy } from "@/content/site";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: privacy.meta.title,
  description: privacy.meta.description,
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return <LegalPage content={privacy} />;
}
