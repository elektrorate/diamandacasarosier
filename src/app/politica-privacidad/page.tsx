import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/features/legal/PrivacyPolicyPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de Casa Rosier."
};

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return <PrivacyPolicyPage />;
}
