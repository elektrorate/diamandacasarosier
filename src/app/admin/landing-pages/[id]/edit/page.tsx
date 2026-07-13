import LandingPageForm from "@/components/admin/LandingPageForm";
import { getLandingPageById } from "@/lib/cms/landing-pages";
import { notFound } from "next/navigation";

export default async function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const item = await getLandingPageById((await params).id);
  if (!item) notFound();
  return (
    <div className="page-card">
      <div className="page-header"><h2>Editar: {item.title}</h2><a className="secondary-btn" href="/admin/landing-pages">Volver</a></div>
      <LandingPageForm mode="edit" item={item} />
    </div>
  );
}
