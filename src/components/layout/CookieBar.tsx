"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const COOKIE_CONSENT_KEY = "casarosier_cookie_consent_v2";
const LEGACY_COOKIE_KEY = "casarosier_cookie_accept_v1";

type CookieConsentStatus = "accepted" | "rejected";

export function CookieBar() {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const readPreference = () => {
      try {
        const hasConsent =
          window.localStorage.getItem(COOKIE_CONSENT_KEY) ||
          window.localStorage.getItem(LEGACY_COOKIE_KEY);
        setVisible(!hasConsent);
      } catch {
        setVisible(true);
      }
    };
    queueMicrotask(readPreference);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("cookiebar-visible", visible);
    document.body.style.setProperty(
      "--cookiebar-offset",
      visible ? `${barRef.current?.offsetHeight ?? 0}px` : "0px"
    );
    return () => {
      document.body.classList.remove("cookiebar-visible");
      document.body.style.removeProperty("--cookiebar-offset");
    };
  }, [visible]);

  const choose = (status: CookieConsentStatus) => {
    try {
      window.localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({
          status,
          version: 2,
          necessary: true,
          analytics: status === "accepted",
          marketing: status === "accepted",
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // The preference still applies for the current page.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      id="cookiebar"
      className="cookiebar"
      ref={barRef}
      role="region"
      aria-label="Aviso de cookies"
    >
      <div className="cookiebar__inner">
        <p className="cookiebar__text">
          Usamos cookies necesarias y, con tu permiso, analíticas para mejorar
          la experiencia. Consulta la{" "}
          <Link href="/politica-privacidad">política de privacidad</Link>.
        </p>
        <div className="cookiebar__actions">
          <button
            className="cookiebar__btn"
            type="button"
            onClick={() => choose("rejected")}
          >
            Rechazar
          </button>
          <button
            className="cookiebar__btn cookiebar__btn--primary"
            type="button"
            onClick={() => choose("accepted")}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
