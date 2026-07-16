"use client";

import Image from "next/image";
import { useId, useState, type CSSProperties, type InputHTMLAttributes } from "react";
import { PublicHeroContent } from "@/components/hero/PublicHeroContent";
import type { CmsHeroSettings, ClassHeroVariant } from "@/lib/cms/types";
import ColorPickerField from "./ColorPickerField";
import MediaSelectField from "./MediaSelectField";
import RichTextField from "./RichTextField";

type DeviceKey = "phone" | "tablet" | "desktop";

const devices: Array<{ key: DeviceKey; label: string; width: number; height: number }> = [
  { key: "phone", label: "Teléfono", width: 390, height: 520 },
  { key: "tablet", label: "Tablet", width: 760, height: 540 },
  { key: "desktop", label: "Desktop", width: 1180, height: 620 },
];

function FieldLabel({ children, htmlFor }: { children: string; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="text-label-md font-bold uppercase tracking-wide text-on-surface-variant">{children}</label>;
}

function TextField({
  label,
  help,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; help?: string }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helpId = help ? `${inputId}-help` : undefined;

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <input
        {...props}
        id={inputId}
        aria-describedby={helpId}
        value={props.value ?? ""}
        className={`block min-h-11 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container ${props.className ?? ""}`}
      />
      {help ? <p id={helpId} className="text-label-md text-on-surface-variant/70">{help}</p> : null}
    </div>
  );
}

function deviceKeys(device: DeviceKey) {
  if (device === "phone") {
    return {
      logoX: "heroLogoMobilePositionX",
      logoY: "heroLogoMobilePositionY",
      logoWidth: "heroLogoMobileWidth",
      menuY: "heroMenuMobilePositionY",
      titleScale: "titleImageScaleMobile",
      titlePosX: "titleImagePositionXMobile",
      titlePosY: "titleImagePositionYMobile",
      titleSecondaryScale: "titleImageSecondaryScaleMobile",
      titleSecondaryPosX: "titleImageSecondaryPositionXMobile",
      titleSecondaryPosY: "titleImageSecondaryPositionYMobile",
      heroTitleX: "heroTitlePositionXMobile",
      heroTitleY: "heroTitlePositionYMobile",
      heroTitleScale: "heroTitleScaleMobile",
      presentationTextX: "presentationTextPositionXMobile",
      presentationTextY: "presentationTextPositionYMobile",
      presentationTextScale: "presentationTextScaleMobile",
      presentationImageX: "presentationImagePositionXMobile",
      presentationImageY: "presentationImagePositionYMobile",
      presentationImageScale: "presentationImageScaleMobile",
    } as const;
  }
  if (device === "tablet") {
    return {
      logoX: "heroLogoTabletPositionX",
      logoY: "heroLogoTabletPositionY",
      logoWidth: "heroLogoTabletWidth",
      menuY: "heroMenuTabletPositionY",
      titleScale: "titleImageScaleTablet",
      titlePosX: "titleImagePositionXTablet",
      titlePosY: "titleImagePositionYTablet",
      titleSecondaryScale: "titleImageSecondaryScaleTablet",
      titleSecondaryPosX: "titleImageSecondaryPositionXTablet",
      titleSecondaryPosY: "titleImageSecondaryPositionYTablet",
      heroTitleX: "heroTitlePositionXTablet",
      heroTitleY: "heroTitlePositionYTablet",
      heroTitleScale: "heroTitleScaleTablet",
      presentationTextX: "presentationTextPositionXTablet",
      presentationTextY: "presentationTextPositionYTablet",
      presentationTextScale: "presentationTextScaleTablet",
      presentationImageX: "presentationImagePositionXTablet",
      presentationImageY: "presentationImagePositionYTablet",
      presentationImageScale: "presentationImageScaleTablet",
    } as const;
  }
  return {
    logoX: "heroLogoPositionX",
    logoY: "heroLogoPositionY",
    logoWidth: "heroLogoWidth",
    menuY: "heroMenuPositionY",
    titleScale: "titleImageScale",
    titlePosX: "titleImagePositionX",
    titlePosY: "titleImagePositionY",
    titleSecondaryScale: "titleImageSecondaryScale",
    titleSecondaryPosX: "titleImageSecondaryPositionX",
    titleSecondaryPosY: "titleImageSecondaryPositionY",
    heroTitleX: "heroTitlePositionX",
    heroTitleY: "heroTitlePositionY",
    heroTitleScale: "heroTitleScale",
    presentationTextX: "presentationTextPositionX",
    presentationTextY: "presentationTextPositionY",
    presentationTextScale: "presentationTextScale",
    presentationImageX: "presentationImagePositionX",
    presentationImageY: "presentationImagePositionY",
    presentationImageScale: "presentationImageScale",
  } as const;
}

function heroText(details: CmsHeroSettings, key: keyof CmsHeroSettings) {
  const value = details[key];
  return typeof value === "string" ? value : "";
}

function heroScale(details: CmsHeroSettings, key: keyof CmsHeroSettings) {
  const value = details[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 1;
}

function ScaleField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const inputId = useId();

  return (
    <div className="cms-hero-menu-scale">
      <div className="cms-hero-menu-scale__head">
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
        <span aria-hidden="true">{value.toFixed(2)}x</span>
      </div>
      <input id={inputId} type="range" min="0.5" max="2" step="0.05" value={value} aria-valuetext={`${value.toFixed(2)}x`} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

export default function SharedHeroEditor({
  details,
  titleFallback,
  subtitleFallback,
  onChange,
}: {
  details: CmsHeroSettings;
  titleFallback: string;
  subtitleFallback?: string;
  onChange: (next: Partial<CmsHeroSettings>) => void;
}) {
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const menuScaleId = useId();
  const preset = devices.find((item) => item.key === device) ?? devices[2];
  const keys = deviceKeys(device);
  const navColor = details.heroMenuColor || (details.heroMenuTone === "light" ? "#ffffff" : "#3f3933");
  const isImageHero = details.heroVariant === "image";
  const isPresentationHero = details.heroVariant === "presentation";
  const frameStyle = {
    width: `${preset.width}px`,
    height: `${preset.height}px`,
    maxWidth: "100%",
    "--presentation-text-position-x": heroText(details, keys.presentationTextX) || "8%",
    "--presentation-text-position-y": heroText(details, keys.presentationTextY) || "50%",
    "--presentation-text-scale": heroScale(details, keys.presentationTextScale),
    "--presentation-image-position-x": heroText(details, keys.presentationImageX) || "70%",
    "--presentation-image-position-y": heroText(details, keys.presentationImageY) || "50%",
    "--presentation-image-scale": heroScale(details, keys.presentationImageScale),
    background: isPresentationHero
      ? `url("${device === "phone" && details.heroImageMobile ? details.heroImageMobile : details.heroImage}") center / cover no-repeat`
      : isImageHero
        ? `linear-gradient(to bottom, rgba(58,48,37,.2), rgba(251,250,246,.94)), url("${device === "phone" && details.heroImageMobile ? details.heroImageMobile : details.heroImage}") center / cover no-repeat`
        : "#fbfaf6",
  } as CSSProperties;
  const menuStyle = {
    top: heroText(details, keys.menuY) || "132px",
    color: navColor,
    transform: `translateX(-50%) scale(${device === "desktop" ? details.heroMenuScale ?? 1 : 1})`,
  } as CSSProperties;
  const logoMask = {
    backgroundColor: navColor,
    WebkitMaskImage: 'url("/img/logo-header.png")',
    maskImage: 'url("/img/logo-header.png")',
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: device === "desktop" ? "center" : "left center",
    maskPosition: device === "desktop" ? "center" : "left center",
  } as CSSProperties;

  function setVariant(heroVariant: ClassHeroVariant) {
    onChange({
      heroVariant,
      heroMenuTone: heroVariant === "text" ? "dark" : "light",
      heroMenuColor: heroVariant === "text" ? "#3f3933" : "#ffffff",
    });
  }

  return (
    <div className="space-y-6">
      <section className="form-block cms-editor-card">
        <div className="cms-editor-card__head">
          <div>
            <p className="auth-kicker">Hero</p>
            <h3>Presentación principal</h3>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {([
            ["image", "Hero con imagen", "Fondo con imagen y arte/título superpuesto."],
            ["presentation", "Hero con presentación", "Fondo, texto enriquecido a la izquierda e imagen a la derecha."],
            ["text", "Hero tipográfico", "Hero sobrio con título y subtítulo editables."],
          ] as Array<[ClassHeroVariant, string, string]>).map(([value, label, description]) => (
            <button
              type="button"
              key={value}
              className={`rounded-2xl border p-4 text-left transition-colors ${details.heroVariant === value ? "border-secondary bg-secondary-container/20" : "border-outline-variant hover:bg-surface-container-low"}`}
              onClick={() => setVariant(value)}
            >
              <strong className="block text-title-sm text-on-surface">{label}</strong>
              <span className="mt-1 block text-body-sm text-on-surface-variant">{description}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextField label="Título del hero" value={details.heroTitle} placeholder={titleFallback} onChange={(event) => onChange({ heroTitle: event.target.value })} />
          <TextField label="Subtítulo del hero" value={details.heroSubtitle} placeholder={subtitleFallback} onChange={(event) => onChange({ heroSubtitle: event.target.value })} />
          {details.heroVariant === "presentation" ? (
            <div className="cms-shared-hero-image-fields md:col-span-2">
              <MediaSelectField
                label="Imagen de fondo"
                value={details.heroImage}
                onChange={(heroImage) => onChange({ heroImage })}
                className="cms-shared-hero-image-fields__background"
                previewClassName="cms-shared-hero-media-preview"
              />
              <MediaSelectField
                label="Imagen de fondo para móvil (opcional)"
                value={details.heroImageMobile}
                onChange={(heroImageMobile) => onChange({ heroImageMobile })}
                className="cms-shared-hero-image-fields__background-mobile"
                previewClassName="cms-shared-hero-media-preview"
              />
            </div>
          ) : null}
          {details.heroVariant === "image" ? (
            <div className="cms-shared-hero-image-fields md:col-span-2">
              <MediaSelectField
                label="Imagen de fondo"
                value={details.heroImage}
                onChange={(heroImage) => onChange({ heroImage })}
                className="cms-shared-hero-image-fields__background"
                previewClassName="cms-shared-hero-media-preview"
              />
              <MediaSelectField
                label="Imagen de fondo para móvil (opcional)"
                value={details.heroImageMobile}
                onChange={(heroImageMobile) => onChange({ heroImageMobile })}
                className="cms-shared-hero-image-fields__background-mobile"
                previewClassName="cms-shared-hero-media-preview"
              />
              <div className="cms-shared-hero-image-fields__titles">
                <div className="cms-hero-overlay-images__head">
                  <h4>Imágenes superpuestas del hero</h4>
                  <p>La imagen 1 se muestra detrás y la imagen 2 se coloca delante para formar la composición visual.</p>
                </div>
                <MediaSelectField
                  label="Imagen superpuesta 1"
                  value={details.titleImage}
                  onChange={(titleImage) => onChange({ titleImage })}
                  previewClassName="cms-shared-hero-title-preview"
                />
                <MediaSelectField
                  label="Imagen superpuesta 2"
                  value={details.titleImageSecondary}
                  onChange={(titleImageSecondary) => onChange({ titleImageSecondary })}
                  previewClassName="cms-shared-hero-title-preview"
                />
              </div>
            </div>
          ) : null}
          {details.heroVariant === "presentation" ? (
            <div className="cms-shared-hero-presentation-layout md:col-span-2">
              <div className="cms-shared-hero-presentation-layout__main">
                <RichTextField label="Texto de presentación" value={details.heroPresentationText} onChange={(heroPresentationText) => onChange({ heroPresentationText })} minHeight="220px" />
                <ColorPickerField label="Color del texto" value={details.heroPresentationTextColor || "#FFFFFF"} onChange={(heroPresentationTextColor) => onChange({ heroPresentationTextColor })} />
              </div>
              <aside className="cms-shared-hero-presentation-layout__side">
                <MediaSelectField
                  label="Imagen lateral"
                  value={details.heroPresentationImage}
                  onChange={(heroPresentationImage) => onChange({ heroPresentationImage })}
                  previewClassName="cms-shared-hero-side-preview"
                />
              </aside>
            </div>
          ) : null}
        </div>
      </section>

      <section className="form-block cms-editor-card cms-hero-position-card">
        <div className="cms-editor-card__head cms-hero-position-card__head">
          <div>
            <h3>Posición responsive del hero</h3>
            <p>Ajusta el logotipo y el menú inicial por dispositivo. Los valores aceptan %, px o rem.</p>
          </div>
          <div className="cms-hero-device-tabs" role="tablist" aria-label="Dispositivo para editar posiciones del hero">
            {devices.map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() => setDevice(item.key)}
                className={device === item.key ? "is-active" : ""}
                role="tab"
                aria-selected={device === item.key}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cms-hero-position-grid">
          <fieldset className="cms-hero-position-fieldset">
            <legend>Propiedades del logo</legend>
            <div className="cms-hero-position-fields cms-hero-position-fields--logo">
              <TextField label="Logo X" value={heroText(details, keys.logoX)} onChange={(event) => onChange({ [keys.logoX]: event.target.value } as Partial<CmsHeroSettings>)} />
              <TextField label="Logo Y" value={heroText(details, keys.logoY)} onChange={(event) => onChange({ [keys.logoY]: event.target.value } as Partial<CmsHeroSettings>)} />
              <TextField label="Tamaño logo" value={heroText(details, keys.logoWidth)} onChange={(event) => onChange({ [keys.logoWidth]: event.target.value } as Partial<CmsHeroSettings>)} />
            </div>
          </fieldset>

          <fieldset className="cms-hero-position-fieldset">
            <legend>Propiedades del menú</legend>
            <div className="cms-hero-position-fields cms-hero-position-fields--menu">
              <ColorPickerField
                label="Color del menú y logo"
                value={navColor}
                help="Aplica al logo, texto, iconos y separadores del menú del hero."
                onChange={(heroMenuColor) => onChange({ heroMenuColor, heroMenuTone: heroMenuColor.toLowerCase() === "#ffffff" ? "light" : "dark" })}
              />
              <TextField
                label="Menú inicial Y"
                value={heroText(details, keys.menuY)}
                help="También define cuándo aparece la barra secundaria en este dispositivo."
                onChange={(event) => onChange({ [keys.menuY]: event.target.value } as Partial<CmsHeroSettings>)}
              />
              {device === "desktop" ? (
                <div className="cms-hero-menu-scale">
                  <div className="cms-hero-menu-scale__head">
                    <FieldLabel htmlFor={menuScaleId}>Escala del menú en computadora</FieldLabel>
                    <span>{(details.heroMenuScale ?? 1).toFixed(2)}x</span>
                  </div>
                  <input id={menuScaleId} type="range" min="0.75" max="1.4" step="0.05" value={details.heroMenuScale ?? 1} aria-valuetext={`${(details.heroMenuScale ?? 1).toFixed(2)}x`} onChange={(event) => onChange({ heroMenuScale: Number(event.target.value) })} />
                  <p>Esta escala solo se aplica al menú expandido de escritorio.</p>
                </div>
              ) : (
                <p className="cms-hero-mobile-menu-note">
                  En tablet y teléfono el hero usa logo a la izquierda y menú de hamburguesa a la derecha; la escala no aplica para estos dispositivos.
                </p>
              )}
            </div>
          </fieldset>
        </div>

        {isImageHero ? (
          <div className="cms-hero-position-grid">
            <div className="cms-hero-overlay-position__head">
              <h4>Posición responsive de imágenes superpuestas</h4>
              <p>Ajusta X, Y y la escala de cada imagen en el dispositivo seleccionado.</p>
            </div>
            <fieldset className="cms-hero-position-fieldset">
              <legend>Imagen superpuesta 1</legend>
              <div className="cms-hero-position-fields">
                <TextField label="Posición X" value={heroText(details, keys.titlePosX)} onChange={(event) => onChange({ [keys.titlePosX]: event.target.value } as Partial<CmsHeroSettings>)} />
                <TextField label="Posición Y" value={heroText(details, keys.titlePosY)} onChange={(event) => onChange({ [keys.titlePosY]: event.target.value } as Partial<CmsHeroSettings>)} />
                <ScaleField label="Escala" value={heroScale(details, keys.titleScale)} onChange={(n) => onChange({ [keys.titleScale]: n } as Partial<CmsHeroSettings>)} />
              </div>
            </fieldset>
            <fieldset className="cms-hero-position-fieldset">
              <legend>Imagen superpuesta 2</legend>
              <div className="cms-hero-position-fields">
                <TextField label="Posición X" value={heroText(details, keys.titleSecondaryPosX)} onChange={(event) => onChange({ [keys.titleSecondaryPosX]: event.target.value } as Partial<CmsHeroSettings>)} />
                <TextField label="Posición Y" value={heroText(details, keys.titleSecondaryPosY)} onChange={(event) => onChange({ [keys.titleSecondaryPosY]: event.target.value } as Partial<CmsHeroSettings>)} />
                <ScaleField label="Escala" value={heroScale(details, keys.titleSecondaryScale)} onChange={(n) => onChange({ [keys.titleSecondaryScale]: n } as Partial<CmsHeroSettings>)} />
              </div>
            </fieldset>
          </div>
        ) : null}

        {!isImageHero && !isPresentationHero ? (
          <div className="cms-hero-position-grid">
            <fieldset className="cms-hero-position-fieldset">
              <legend>Título tipográfico</legend>
              <div className="cms-hero-position-fields">
                <TextField label="Posición X" value={heroText(details, keys.heroTitleX)} onChange={(event) => onChange({ [keys.heroTitleX]: event.target.value } as Partial<CmsHeroSettings>)} />
                <TextField label="Posición Y" value={heroText(details, keys.heroTitleY)} onChange={(event) => onChange({ [keys.heroTitleY]: event.target.value } as Partial<CmsHeroSettings>)} />
                <ScaleField label="Escala del título y subtítulo" value={heroScale(details, keys.heroTitleScale)} onChange={(n) => onChange({ [keys.heroTitleScale]: n } as Partial<CmsHeroSettings>)} />
              </div>
            </fieldset>
          </div>
        ) : null}

        {isPresentationHero ? (
          <div className="cms-hero-position-grid">
            <fieldset className="cms-hero-position-fieldset">
              <legend>Texto de presentación (izquierda)</legend>
              <div className="cms-hero-position-fields">
                <TextField label="Posición X" value={heroText(details, keys.presentationTextX)} onChange={(event) => onChange({ [keys.presentationTextX]: event.target.value } as Partial<CmsHeroSettings>)} />
                <TextField label="Posición Y" value={heroText(details, keys.presentationTextY)} onChange={(event) => onChange({ [keys.presentationTextY]: event.target.value } as Partial<CmsHeroSettings>)} />
                <ScaleField label="Escala" value={heroScale(details, keys.presentationTextScale)} onChange={(n) => onChange({ [keys.presentationTextScale]: n } as Partial<CmsHeroSettings>)} />
              </div>
            </fieldset>
            <fieldset className="cms-hero-position-fieldset">
              <legend>Imagen lateral (derecha)</legend>
              <div className="cms-hero-position-fields">
                <TextField label="Posición X" value={heroText(details, keys.presentationImageX)} onChange={(event) => onChange({ [keys.presentationImageX]: event.target.value } as Partial<CmsHeroSettings>)} />
                <TextField label="Posición Y" value={heroText(details, keys.presentationImageY)} onChange={(event) => onChange({ [keys.presentationImageY]: event.target.value } as Partial<CmsHeroSettings>)} />
                <ScaleField label="Escala" value={heroScale(details, keys.presentationImageScale)} onChange={(n) => onChange({ [keys.presentationImageScale]: n } as Partial<CmsHeroSettings>)} />
              </div>
            </fieldset>
          </div>
        ) : null}

        <div className="cms-hero-position-preview" aria-label="Vista de referencia del hero">
          <div className={`relative mx-auto overflow-hidden rounded-xl border border-outline-variant shadow-sm ${isPresentationHero ? "header-interno--presentation-hero" : ""}`} style={frameStyle}>
            {device === "desktop" ? (
              <>
                <span
                  className="absolute z-20 -translate-x-1/2"
                  style={{
                    ...logoMask,
                    left: heroText(details, keys.logoX) || "50%",
                    top: heroText(details, keys.logoY) || "46px",
                    width: heroText(details, keys.logoWidth) || "118px",
                    aspectRatio: "2.2 / 1",
                  }}
                />
                <nav className="absolute left-1/2 z-20 flex whitespace-nowrap text-[12px] font-bold" style={menuStyle} aria-label="Vista previa menú">
                  <ul className="flex list-none items-center gap-4 p-0">
                    {["Inicio", "Clases", "Workshops", "Experiencias", "Gift Cards", "El Estudio", "Shop"].map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </nav>
              </>
            ) : (
              <div className="absolute inset-0 z-20" style={{ color: navColor }}>
                <span
                  className="absolute block -translate-x-1/2"
                  style={{
                    ...logoMask,
                    left: heroText(details, keys.logoX) || "50%",
                    top: heroText(details, keys.logoY) || (device === "tablet" ? "42px" : "34px"),
                    width: heroText(details, keys.logoWidth) || (device === "tablet" ? "106px" : "92px"),
                    aspectRatio: "2.2 / 1",
                  }}
                />
                <span
                  className="absolute right-6 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-current/30"
                  style={{ top: heroText(details, keys.menuY) || (device === "tablet" ? "118px" : "96px") }}
                >
                  <span className="material-symbols-outlined text-[22px]">menu</span>
                </span>
              </div>
            )}
            <div className="absolute inset-0 z-10">
              {details.heroVariant === "presentation" ? (
                <PublicHeroContent
                  hero={{
                    ...details,
                    heroPresentationText: details.heroPresentationText || details.heroTitle || titleFallback,
                  }}
                />
              ) : null}
              {details.heroVariant === "image" ? (
                <div className="absolute inset-0">
                  {details.titleImage ? (
                    <div className="absolute" style={{
                      left: heroText(details, keys.titlePosX) || "50%",
                      top: heroText(details, keys.titlePosY) || "50%",
                      transform: `translate(-50%, -50%) scale(${heroScale(details, keys.titleScale)})`,
                      transformOrigin: "center center",
                      width: "50%",
                      height: "30%",
                    }}>
                      <Image src={details.titleImage} alt="" fill sizes="700px" className="object-contain opacity-80" unoptimized />
                    </div>
                  ) : null}
                  {details.titleImageSecondary ? (
                    <div className="absolute" style={{
                      left: heroText(details, keys.titleSecondaryPosX) || "50%",
                      top: heroText(details, keys.titleSecondaryPosY) || "50%",
                      transform: `translate(-50%, -50%) scale(${heroScale(details, keys.titleSecondaryScale)})`,
                      transformOrigin: "center center",
                      width: "50%",
                      height: "30%",
                    }}>
                      <Image src={details.titleImageSecondary} alt="" fill sizes="700px" className="object-contain" unoptimized />
                    </div>
                  ) : null}
                </div>
              ) : null}
              {details.heroVariant === "text" ? (
                <div className="absolute w-full text-center" style={{
                  left: heroText(details, keys.heroTitleX) || "50%",
                  top: heroText(details, keys.heroTitleY) || "50%",
                  transform: `translate(-50%, -50%) scale(${heroScale(details, keys.heroTitleScale)})`,
                  transformOrigin: "center center",
                }}>
                  <h3 className="font-serif text-[clamp(30px,4vw,54px)] uppercase leading-none text-[#5b554f]">{details.heroTitle || titleFallback}</h3>
                  <p className="mt-4 text-label-md uppercase text-[#a99b90]">{details.heroSubtitle || subtitleFallback}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
