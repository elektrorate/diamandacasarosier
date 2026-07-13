import AdminShell from "@/components/admin/AdminShell";

const sections = [
  { name: "Galería social", href: "/admin/components/social-galleries", desc: "Fotos, textos y links del componente social", ready: true },
  { name: "Testimonios", href: "/admin/components/testimonials", desc: "Testimonios y reseñas", ready: true },
  { name: "Banners promocionales", href: "/admin/components/promo-banners", desc: "Banners promocionales", ready: true },
  { name: "FAQs", href: "/admin/components/faqs", desc: "Preguntas frecuentes", ready: true },
];

export default function ComponentsPage() {
  return (
    <AdminShell>
      <div className="section-head">
        <div>
          <p className="auth-kicker">CMS</p>
          <h2>Components</h2>
        </div>
      </div>
      <p className="note">Componentes reutilizables del sitio. Cada sección permite crear, editar y gestionar bloques independientes.</p>
      <div className="media-grid" style={{ marginTop: "1rem" }}>
        {sections.map((s) => (
          <a key={s.href} href={s.ready ? s.href : undefined} className="panel-card" style={{ cursor: s.ready ? "pointer" : "default", opacity: s.ready ? 1 : 0.5 }}>
            <h3>{s.name}</h3>
            <p className="muted">{s.desc}</p>
            {!s.ready ? <p className="note" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>Próximamente</p> : null}
          </a>
        ))}
      </div>
    </AdminShell>
  );
}
