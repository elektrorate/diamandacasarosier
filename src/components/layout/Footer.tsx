import { getPublicFooter } from "@/lib/cms/footers";
import { PublicFooterContent } from "./PublicFooterContent";

export async function Footer({ socialTrack = false }: { socialTrack?: boolean }) {
  const footer = await getPublicFooter();
  return <PublicFooterContent footer={footer} socialTrack={socialTrack} />;
}
