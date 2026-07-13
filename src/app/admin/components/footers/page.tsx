import AdminShell from "@/components/admin/AdminShell";
import FooterForm from "@/components/admin/FooterForm";
import { createFooter, getFooters } from "@/lib/cms/footers";

async function getEditableFooter() {
  const footers = await getFooters();
  const existing =
    footers.find((footer) => footer.status === "published" && footer.deleted_at === null) ??
    footers.find((footer) => footer.deleted_at === null);

  if (existing) return existing;

  return createFooter({
    name: "Footer principal",
    status: "published",
    contact_title: "Contacto",
    contact_text: "+34 600 000 000\nBarcelona, Espana\nLunes a Sabado - 10:00 a 20:00\nSiguenos en Nuestras Redes:",
    form_button_color: "#111111",
    form_button_text_color: "#ffffff",
    social_button_color: "#2f2723",
    social_icon_color: "#ffffff",
    social_links: [
      {
        platform: "instagram",
        url: "https://www.facebook.com/casarosier",
        label: "Instagram",
        icon_url: "/img/icon-instagram.svg",
        icon_color: "#ffffff",
        button_color: "#2f2723",
      },
      {
        platform: "facebook",
        url: "https://www.facebook.com/casarosier",
        label: "Facebook",
        icon_url: "/img/icon-facebook.svg",
        icon_color: "#ffffff",
        button_color: "#2f2723",
      },
    ],
  });
}

export default async function Page() {
  const footer = await getEditableFooter();

  return (
    <AdminShell>
      <div className="cms-editor-shell">
        <header className="cms-page-editor-head">
          <div className="cms-page-editor-head__main">
            <h1>Footer</h1>
            <p>Edicion del footer global que se muestra en todas las paginas</p>
            <div className="cms-page-editor-meta">
              <span>{footer.social_links.length} redes sociales</span>
              <span>Enlaces legales fijos</span>
            </div>
          </div>
        </header>
        <FooterForm mode="edit" item={footer} singleton />
      </div>
    </AdminShell>
  );
}
