"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

function generateUrl(destination: string, source: string, medium: string, campaign: string, content?: string, term?: string): string {
  if (!destination || !source || !medium || !campaign) return "";
  const params = new URLSearchParams({ utm_source: source, utm_medium: medium, utm_campaign: campaign });
  if (content) params.set("utm_content", content);
  if (term) params.set("utm_term", term);
  const sep = destination.includes("?") ? "&" : "?";
  return `${destination}${sep}${params.toString()}`;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CampaignForm({ initial }: { initial?: Partial<{
  id: string; name: string; slug: string;
  utm_source: string; utm_medium: string; utm_campaign: string;
  utm_content: string; utm_term: string;
  destination_url: string; generated_url: string;
  start_date: string; end_date: string; notes: string;
}> }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    utm_source: initial?.utm_source ?? "",
    utm_medium: initial?.utm_medium ?? "",
    utm_campaign: initial?.utm_campaign ?? "",
    utm_content: initial?.utm_content ?? "",
    utm_term: initial?.utm_term ?? "",
    destination_url: initial?.destination_url ?? "",
    start_date: initial?.start_date ?? "",
    end_date: initial?.end_date ?? "",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatedUrl = useMemo(
    () => generateUrl(form.destination_url, form.utm_source, form.utm_medium, form.utm_campaign, form.utm_content, form.utm_term),
    [form.destination_url, form.utm_source, form.utm_medium, form.utm_campaign, form.utm_content, form.utm_term],
  );
  const requiredComplete = Boolean(form.name && form.slug && form.destination_url && form.utm_source && form.utm_medium && form.utm_campaign && generatedUrl);

  function update(field: string, value: string) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "name") {
        const slug = slugify(value);
        if (!current.slug) next.slug = slug;
        if (!current.utm_campaign) next.utm_campaign = slug.replaceAll("-", "_");
      }
      return next;
    });
  }

  async function handleSave() {
    if (!requiredComplete) return;
    setSaving(true);
    const body = { ...form, generated_url: generatedUrl };
    const res = await fetch(isEdit ? `/api/admin/marketing/campaigns/${initial!.id}` : "/api/admin/marketing/campaigns", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) router.push("/admin/marketing/campaigns");
    setSaving(false);
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const fields: { label: string; key: string; placeholder: string; required?: boolean; fullWidth?: boolean }[] = [
    { label: "Nombre de campaña", key: "name", placeholder: "Ej: Lanzamiento taller esmaltes", required: true },
    { label: "Slug", key: "slug", placeholder: "Ej: lanzamiento-taller-esmaltes", required: true },
    { label: "Fuente UTM (utm_source)", key: "utm_source", placeholder: "instagram, google, newsletter", required: true },
    { label: "Medio UTM (utm_medium)", key: "utm_medium", placeholder: "social, email, cpc", required: true },
    { label: "Campaña UTM (utm_campaign)", key: "utm_campaign", placeholder: "lanzamiento_verano", required: true },
    { label: "Contenido UTM (utm_content)", key: "utm_content", placeholder: "Opcional: hero_banner, sidebar" },
    { label: "Término UTM (utm_term)", key: "utm_term", placeholder: "Opcional: keyword" },
    { label: "URL destino", key: "destination_url", placeholder: "https://casarosierceramica.com/...", required: true, fullWidth: true },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 shadow-[0_8px_20px_rgba(11,28,48,0.04)]">
        <label className="mb-1 block text-label-sm font-medium text-on-surface">URL Generada</label>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <input type="text" readOnly value={generatedUrl} placeholder="La URL se generará automáticamente..." className="flex-1 rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-sm text-on-surface font-mono" />
          <button type="button" onClick={handleCopyUrl} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-outline-variant bg-white px-3 text-label-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container" aria-label="Copiar URL generada" disabled={!generatedUrl}>
            <span className="material-symbols-outlined text-lg" aria-hidden="true">{copied ? "check" : "content_copy"}</span>
            {copied ? "Copiada" : "Copiar"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Requirement ready={Boolean(form.destination_url)} label="URL destino" />
          <Requirement ready={Boolean(form.utm_source)} label="Fuente" />
          <Requirement ready={Boolean(form.utm_medium)} label="Medio" />
          <Requirement ready={Boolean(form.utm_campaign)} label="Campaña" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-outline-variant bg-white p-5 shadow-[0_12px_28px_rgba(11,28,48,0.05)] sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.fullWidth ? "sm:col-span-2" : ""}>
            <label className="mb-1 block text-label-sm font-medium text-on-surface">{f.label}</label>
            <input
              type="text"
              value={String((form as Record<string, string>)[f.key] ?? "")}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-label-sm font-medium text-on-surface">Fecha inicio</label>
          <input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md text-on-surface focus:border-secondary focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-label-sm font-medium text-on-surface">Fecha fin</label>
          <input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md text-on-surface focus:border-secondary focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-label-sm font-medium text-on-surface">Notas internas</label>
        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none" />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !requiredComplete}>{saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear campaña"}</Button>
        <Button variant="ghost" onClick={() => router.push("/admin/marketing/campaigns")}>Cancelar</Button>
      </div>
    </div>
  );
}

function Requirement({ ready, label }: { ready: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm font-bold ${ready ? "bg-green-100 text-green-700" : "bg-white text-on-surface-variant"}`}>
      <span className="material-symbols-outlined text-sm" aria-hidden="true">{ready ? "check_circle" : "radio_button_unchecked"}</span>
      {label}
    </span>
  );
}
