"use client";

import { Carousel } from "@/components/ui/Carousel";
import type { FooterComponent } from "@/lib/cms/types";
import FooterContactForm from "./FooterContactForm";
import type { CSSProperties } from "react";

function fallbackSocialIcon(platform: string) {
  const key = platform.toLowerCase();
  if (key.includes("facebook")) return "/img/icon-facebook.svg";
  if (key.includes("whatsapp")) return "/img/icon-whatsapp.svg";
  return "/img/icon-instagram.svg";
}

export function PublicFooterContent({
  footer,
  socialTrack = false,
  preview = false,
}: {
  footer?: FooterComponent | null;
  socialTrack?: boolean;
  preview?: boolean;
}) {
  const socialLinks = footer?.social_links?.length ? footer.social_links : [
    { platform: "Instagram", label: "Instagram", url: "https://www.facebook.com/casarosier", icon_url: "/img/icon-instagram.svg" },
    { platform: "Facebook", label: "Facebook", url: "https://www.facebook.com/casarosier", icon_url: "/img/icon-facebook.svg" },
  ];
  const contactLines = (footer?.contact_text || "+34 600 000 000\nBarcelona, Espana\nLunes a Sabado - 10:00 a 20:00\nSiguenos en Nuestras Redes:")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const socialTitle = contactLines.pop() || "Siguenos en Nuestras Redes:";
  const footerStyle = {
    "--contact-submit-bg": footer?.form_button_color || "#111111",
    "--contact-submit-color": footer?.form_button_text_color || "#ffffff",
    "--contact-social-bg": footer?.social_button_color || "#2f2723",
    "--contact-social-icon": footer?.social_icon_color || "#ffffff",
  } as CSSProperties;
  const socialLoop = Array.from({ length: 12 }, (_, index) => (index % 4) + 1);

  return (
    <footer id="footer" className="site-footer" style={footerStyle}>
      {socialTrack && (
        <Carousel
          items={socialLoop}
          ariaLabel="Galeria social continua"
          className="footer-social"
          viewportClassName="footer-social__viewport"
          trackClassName="footer-social__track is-animated"
          slideClassName="footer-social__slide"
          marquee
          renderItem={(index, { realIndex, isDuplicate }) => (
            <a
              className="footer-social__item"
              href="https://www.facebook.com/casarosier"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isDuplicate || realIndex > 3 ? -1 : undefined}
            >
              <img
                src={
                  index === 4
                    ? "/img/social-4.jpeg"
                    : `/img/social-${index}.jpg`
                }
                alt={isDuplicate || realIndex > 3 ? "" : `Instagram ${index}`}
                loading="lazy"
                decoding="async"
              />
            </a>
          )}
        />
      )}
      <section id="contacto-footer" className="contact-footer">
        <div className="container contact-footer__container">
          <FooterContactForm preview={preview} />
          <div className="contact-info">
            <h2 className="contact-info__title">{footer?.contact_title || "Contacto"}</h2>
            {contactLines.map((line, index) => (
              <p className={index === 0 ? "contact-info__text" : "contact-info__line"} key={`${line}-${index}`}>
                {line}
              </p>
            ))}
            <p className="contact-info__social-title">
              {socialTitle}
            </p>
            <div className="contact-info__social">
              {socialLinks.map((link, index) => (
                <a
                  className="contact-info__social-link"
                  href={link.url}
                  aria-label={link.label || link.platform || `Red social ${index + 1}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    "--contact-social-bg": footer?.social_button_color || "#2f2723",
                    "--contact-social-icon": footer?.social_icon_color || "#ffffff",
                  } as CSSProperties}
                  key={`${link.platform}-${index}`}
                >
                  <span
                    className="contact-info__social-icon"
                    aria-hidden="true"
                    style={{
                      "--contact-social-icon-url": `url("${link.icon_url || fallbackSocialIcon(link.platform)}")`,
                      "--contact-social-icon": footer?.social_icon_color || "#ffffff",
                    } as CSSProperties}
                  />
                </a>
              ))}
            </div>
            <div className="contact-info__legal-links" aria-label="Enlaces legales">
              <a className="contact-info__legal-link" href="/politica-privacidad">
                Política y privacidad
              </a>
              <a className="contact-info__legal-link" href="/auth">
                Administración
              </a>
            </div>
          </div>
        </div>
      </section>
      <div className="site-legal">
        <p className="site-legal__copy">&copy; Casa Rosier</p>
      </div>
    </footer>
  );
}
