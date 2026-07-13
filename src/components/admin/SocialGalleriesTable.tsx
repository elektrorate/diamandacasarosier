"use client";

import type { SocialGallery } from "@/lib/cms/types";

export default function SocialGalleriesTable({ items }: { items: SocialGallery[] }) {
  return (
    <div className="admin-card-list">
      {items.map((gallery) => (
        <article key={gallery.id} className="admin-list-card">
          <div className="promo-admin-card__preview">
            {gallery.items.find((item) => item.image_url)?.image_url ? (
              <img src={gallery.items.find((item) => item.image_url)?.image_url} alt={gallery.title || "Galería social"} />
            ) : (
              <span>Sin imagen</span>
            )}
          </div>
          <div className="admin-list-card__body">
            <div className="admin-list-card__head">
              <div>
                <h3>{gallery.title || "Galería social"}</h3>
                <p>{gallery.description || "Sin descripción."}</p>
              </div>
            </div>
            <div className="admin-list-card__meta">
              <span>{gallery.items.length} fotos</span>
              <span>Actualizado {new Date(gallery.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="row-actions admin-list-card__actions">
              <a className="link-btn" href="/admin/components/social-galleries">
                Editar componente
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
