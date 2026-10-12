import type { Metadata } from "next";

import { legalNotice } from "@/content/site";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: legalNotice.meta.title,
  description: legalNotice.meta.description,
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return <LegalPage content={legalNotice} />;
}
