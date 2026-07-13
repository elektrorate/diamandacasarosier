import AdminShell from "@/components/admin/AdminShell";
import SocialGalleryForm from "@/components/admin/SocialGalleryForm";
import { getSocialGalleries } from "@/lib/cms/social-galleries";

export default async function Page() {
  const galleries = await getSocialGalleries();
  const gallery = galleries
    .filter((item) => !item.deleted_at)
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0];

  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Galería social</h2>
          <p className="muted">Edita el componente de fotos sociales que aparece en la web pública.</p>
        </div>
      </div>
      <SocialGalleryForm mode={gallery ? "edit" : "create"} item={gallery} />
    </AdminShell>
  );
}
