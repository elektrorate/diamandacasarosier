import AdminShell from "@/components/admin/AdminShell";
import PageForm from "@/components/admin/PageForm";
import SectionEmptyState from "@/components/admin/SectionEmptyState";
import { getPageById } from "@/lib/cms/pages";
import { getPageFaqSection } from "@/lib/cms/page-faqs";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const pageId = (await params).id;
  const [page, faqSection] = await Promise.all([getPageById(pageId), getPageFaqSection(pageId)]);
  if (!page) {
    return (
      <AdminShell>
        <SectionEmptyState title="Página no encontrada" description="La página que intentas editar no existe o fue eliminada." actionHref="/admin/pages" actionLabel="Volver al listado" />
      </AdminShell>
    );
  }
  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Editar página</h2>
        </div>
      </div>
      <PageForm mode="edit" page={page} faqSection={faqSection} />
    </AdminShell>
  );
}
