import AdminShell from "@/components/admin/AdminShell";
import MediaBrowser from "@/components/admin/MediaBrowser";
import { listMediaAssets } from "@/lib/cms/media";

export default async function MediaPage() {
  const initialData = await listMediaAssets({ page: 1, pageSize: 24, status: "active", sort: "newest" });

  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Biblioteca multimedia</h2>
          <p className="muted">Consulta imágenes, vídeos y documentos registrados en el catálogo multimedia.</p>
        </div>
      </div>
      <MediaBrowser initialData={initialData} />
    </AdminShell>
  );
}