"use client";

import type { Header } from "@/lib/cms/types";

export default function HeaderPreview({ header }: { header: Partial<Header> }) {
  const hasImage = header.desktop_image_url;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-secondary-container/40"
      style={{
        minHeight: header.desktop_height || "200px",
        background: hasImage ? `url(${header.desktop_image_url}) center/cover no-repeat` : "linear-gradient(135deg, #f5f0eb 0%, #e8e0d8 100%)",
      }}
    >
      {header.overlay_enabled && header.overlay_color ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: header.overlay_color || "#000000",
            opacity: (header.overlay_opacity ?? 0.4),
          }}
        />
      ) : null}
      {header.gradient_enabled && header.gradient_css ? (
        <div className="pointer-events-none absolute inset-0" style={{ background: header.gradient_css }} />
      ) : null}

      {header.logo ? (
        <div
          className="pointer-events-none absolute"
          style={{
            left: header.logoPositionX || "8%",
            top: header.logoPositionY || "40px",
            width: header.logoWidth || "120px",
            height: header.logoHeight || "auto",
            zIndex: header.logoZIndex ?? 10,
            display: header.logoVisibleDesktop !== false ? "block" : "none",
          }}
        >
          <img src={header.logo} alt={header.logoAlt || "Logo"} style={{ width: "100%", height: "auto" }} />
        </div>
      ) : (
        <div
          className="pointer-events-none absolute flex items-center justify-center rounded-lg border-2 border-dashed border-secondary-container/60 bg-white/60 px-4 py-2 text-label-md font-bold text-on-surface-variant"
          style={{
            left: header.logoPositionX || "8%",
            top: header.logoPositionY || "40px",
            zIndex: header.logoZIndex ?? 10,
          }}
        >
          LOGO
        </div>
      )}

      {header.overlayImages?.map((item) => (
        <div
          key={item.id}
          className="pointer-events-none absolute"
          style={{
            left: item.positionX || "40%",
            top: item.positionY || "55%",
            width: item.width || "320px",
            height: item.height || "auto",
            zIndex: item.zIndex ?? 1,
            opacity: item.opacity ?? 1,
            transform: item.rotation && item.rotation !== "0deg" ? `rotate(${item.rotation})` : undefined,
            display: item.image && item.visibleDesktop !== false ? "block" : "none",
          }}
        >
          {item.image ? (
            <img src={item.image} alt={item.alt || ""} style={{ width: "100%", height: "auto" }} />
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-secondary-container/40 bg-white/40 px-3 py-2 text-[10px] text-on-surface-variant">
              PNG {item.order + 1}
            </div>
          )}
        </div>
      ))}

      {header.showMenu !== false && header.menuId ? (
        <div
          className="pointer-events-none absolute flex items-center gap-3 rounded-lg bg-black/20 px-4 py-2 text-xs text-white"
          style={{
            left: header.menuPositionX || "50%",
            top: header.menuPositionY || "40px",
            transform: `translateX(-50%)`,
            zIndex: header.menuZIndex ?? 20,
            color: header.menuTextColor || "#ffffff",
          }}
        >
          <span>Inicio</span>
          {header.showMenuSeparators ? <span className="text-white/40">|</span> : null}
          <span>Clases</span>
          {header.showMenuSeparators ? <span className="text-white/40">|</span> : null}
          <span>Workshops</span>
          {header.showMenuSeparators ? <span className="text-white/40">|</span> : null}
          <span>Contacto</span>
        </div>
      ) : null}

      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/40 to-transparent px-3 pb-2 pt-8"
        style={{ zIndex: 30 }}
      >
        <span className="rounded bg-white/80 px-2 py-0.5 text-[10px] font-bold text-on-surface">
          {header.visual_variant || "minimal"}
        </span>
        <span className="rounded bg-white/80 px-2 py-0.5 text-[10px] text-on-surface-variant">
          {header.desktop_height || "auto"}
        </span>
      </div>
    </div>
  );
}
