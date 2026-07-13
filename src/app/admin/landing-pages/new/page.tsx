import LandingPageForm from "@/components/admin/LandingPageForm";

export default function NewLandingPage() {
  return (
    <div className="page-card">
      <div className="page-header"><h2>Nueva landing page</h2><a className="secondary-btn" href="/admin/landing-pages">Volver</a></div>
      <LandingPageForm mode="create" />
    </div>
  );
}
