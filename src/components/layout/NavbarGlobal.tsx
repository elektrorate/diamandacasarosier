"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavigationItem } from "@/data/types";
import { classNames } from "@/lib/utils";

const DESKTOP_SUBMENU_CLOSE_DELAY = 320;

export function NavbarGlobal({
  home = false,
  navigationItems,
  logoUrl = "/img/logo-header.png",
  scrollMenuBackgroundColor = "#8c7457",
  scrollMenuTextColor = "#fff9f1",
  scrollMenuIconColor = "#fff9f1",
  scrollMenuLogoTintEnabled = false,
  scrollMenuLogoTintColor = "#fff9f1",
  scrollThreshold = 12,
  tabletScrollThreshold = scrollThreshold,
  mobileScrollThreshold = scrollThreshold,
  heroMenuColor,
  heroMenuScale = 1,
  heroLogoPositionX,
  heroLogoPositionY,
  heroLogoWidth,
  heroLogoTabletPositionX,
  heroLogoTabletPositionY,
  heroLogoTabletWidth,
  heroLogoMobilePositionX,
  heroLogoMobilePositionY,
  heroLogoMobileWidth,
  heroMenuPositionY,
  heroMenuTabletPositionY,
  heroMenuMobilePositionY,
}: {
  home?: boolean;
  navigationItems: NavigationItem[];
  logoUrl?: string;
  scrollMenuBackgroundColor?: string;
  scrollMenuTextColor?: string;
  scrollMenuIconColor?: string;
  scrollMenuLogoTintEnabled?: boolean;
  scrollMenuLogoTintColor?: string;
  scrollThreshold?: number;
  tabletScrollThreshold?: number;
  mobileScrollThreshold?: number;
  heroMenuColor?: string;
  heroMenuScale?: number;
  heroLogoPositionX?: string;
  heroLogoPositionY?: string;
  heroLogoWidth?: string;
  heroLogoTabletPositionX?: string;
  heroLogoTabletPositionY?: string;
  heroLogoTabletWidth?: string;
  heroLogoMobilePositionX?: string;
  heroLogoMobilePositionY?: string;
  heroLogoMobileWidth?: string;
  heroMenuPositionY?: string;
  heroMenuTabletPositionY?: string;
  heroMenuMobilePositionY?: string;
}) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const scrollDesktopCloseTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staticMobileOpen, setStaticMobileOpen] = useState(false);
  const [mobileScrolled, setMobileScrolled] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const [scrollDesktopOpen, setScrollDesktopOpen] = useState<string | null>(
    null
  );
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const mobileItems = navigationItems
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);
  const desktopItems = mobileItems.filter(
    (item) => !home || item.href !== "/#hero"
  );
  const scrollDesktopItems = desktopItems;
  const effectiveScrollIconColor = scrollMenuIconColor || scrollMenuTextColor;
  const navStyle = {
    "--site-scroll-menu-bg": scrollMenuBackgroundColor,
    "--site-scroll-menu-text": scrollMenuTextColor,
    "--site-scroll-menu-icon": effectiveScrollIconColor,
    "--site-scroll-logo-tint": scrollMenuLogoTintColor,
    "--site-hero-menu-color": heroMenuColor,
    "--site-hero-menu-scale": heroMenuScale,
    "--hero-logo-position-x": heroLogoPositionX || "50%",
    "--hero-logo-position-y": heroLogoPositionY || "46px",
    "--hero-logo-width": heroLogoWidth || "118px",
    "--hero-logo-tablet-position-x": heroLogoTabletPositionX || heroLogoPositionX || "50%",
    "--hero-logo-tablet-position-y": heroLogoTabletPositionY || heroLogoPositionY || "42px",
    "--hero-logo-tablet-width": heroLogoTabletWidth || heroLogoWidth || "106px",
    "--hero-logo-mobile-position-x": heroLogoMobilePositionX || heroLogoPositionX || "50%",
    "--hero-logo-mobile-position-y": heroLogoMobilePositionY || "34px",
    "--hero-logo-mobile-width": heroLogoMobileWidth || "92px",
    "--hero-menu-position-y": heroMenuPositionY || "132px",
    "--hero-menu-tablet-position-y": heroMenuTabletPositionY || heroMenuPositionY || "118px",
    "--hero-menu-mobile-position-y": heroMenuMobilePositionY || "96px",
  } as CSSProperties;
  const scrollLogoTintStyle = {
    WebkitMaskImage: `url("${logoUrl.replace(/"/g, "%22")}")`,
    maskImage: `url("${logoUrl.replace(/"/g, "%22")}")`,
  } as CSSProperties;

  const clearDesktopCloseTimeout = useCallback(() => {
    if (desktopCloseTimeoutRef.current) {
      clearTimeout(desktopCloseTimeoutRef.current);
      desktopCloseTimeoutRef.current = null;
    }
  }, []);

  const clearScrollDesktopCloseTimeout = useCallback(() => {
    if (scrollDesktopCloseTimeoutRef.current) {
      clearTimeout(scrollDesktopCloseTimeoutRef.current);
      scrollDesktopCloseTimeoutRef.current = null;
    }
  }, []);

  const openDesktopMenu = useCallback((href: string) => {
    clearDesktopCloseTimeout();
    setDesktopOpen(href);
  }, [clearDesktopCloseTimeout]);

  const closeDesktopMenu = useCallback(() => {
    clearDesktopCloseTimeout();
    setDesktopOpen(null);
  }, [clearDesktopCloseTimeout]);

  const scheduleDesktopMenuClose = useCallback(() => {
    clearDesktopCloseTimeout();
    desktopCloseTimeoutRef.current = setTimeout(() => {
      setDesktopOpen(null);
      desktopCloseTimeoutRef.current = null;
    }, DESKTOP_SUBMENU_CLOSE_DELAY);
  }, [clearDesktopCloseTimeout]);

  const openScrollDesktopMenu = useCallback((href: string) => {
    clearScrollDesktopCloseTimeout();
    setScrollDesktopOpen(href);
  }, [clearScrollDesktopCloseTimeout]);

  const closeScrollDesktopMenu = useCallback(() => {
    clearScrollDesktopCloseTimeout();
    setScrollDesktopOpen(null);
  }, [clearScrollDesktopCloseTimeout]);

  const scheduleScrollDesktopMenuClose = useCallback(() => {
    clearScrollDesktopCloseTimeout();
    scrollDesktopCloseTimeoutRef.current = setTimeout(() => {
      setScrollDesktopOpen(null);
      scrollDesktopCloseTimeoutRef.current = null;
    }, DESKTOP_SUBMENU_CLOSE_DELAY);
  }, [clearScrollDesktopCloseTimeout]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setStaticMobileOpen(false);
        clearDesktopCloseTimeout();
        clearScrollDesktopCloseTimeout();
        setDesktopOpen(null);
        setScrollDesktopOpen(null);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setMobileOpen(false);
        setStaticMobileOpen(false);
        clearDesktopCloseTimeout();
        clearScrollDesktopCloseTimeout();
        setDesktopOpen(null);
        setScrollDesktopOpen(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [clearDesktopCloseTimeout, clearScrollDesktopCloseTimeout]);

  useEffect(() => {
    return () => {
      clearDesktopCloseTimeout();
      clearScrollDesktopCloseTimeout();
    };
  }, [clearDesktopCloseTimeout, clearScrollDesktopCloseTimeout]);

  useEffect(() => {
    const currentThreshold = () => {
      if (window.innerWidth <= 640) return mobileScrollThreshold;
      if (window.innerWidth <= 1024) return tabletScrollThreshold;
      return scrollThreshold;
    };
    const onScroll = () => {
      const scrolled = window.scrollY > currentThreshold();
      setMobileScrolled(scrolled);
      if (scrolled) {
        setStaticMobileOpen(false);
      }
      if (!scrolled) {
        setMobileOpen(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mobileScrollThreshold, scrollThreshold, tabletScrollThreshold]);

  const current = (href: string) =>
    href === "/#hero"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div
      className={classNames(
        "site-nav-shell",
        home ? "site-nav-shell--home" : "site-nav-shell--internal"
      )}
      ref={rootRef}
      style={navStyle}
    >
      <div className="navbar-global hero__top container">
        <Link className="hero__logo" href="/#hero" aria-label="Casa Rosier">
          {heroMenuColor ? (
            <span className="hero__logo-tint" style={scrollLogoTintStyle} aria-hidden="true" />
          ) : (
            <img
              className="hero__logo-image"
              src={logoUrl}
              alt="Casa Rosier"
            />
          )}
        </Link>

        <nav className="hero__nav nav-desktop" aria-label="Principal">
          <ul className="hero__nav-list">
            {desktopItems.map((item, index) => {
              const children =
                item.children?.filter((child) => child.visible) ?? [];
              const open = desktopOpen === item.href;
              const submenuId = `desktop-submenu-${index}`;
              return (
                <li
                  className={classNames(
                    "hero__nav-item",
                    children.length > 0 && "hero__nav-item--has-children",
                    open && "hero__nav-item--open"
                  )}
                  key={item.label}
                  onMouseEnter={() =>
                    children.length > 0 && openDesktopMenu(item.href)
                  }
                  onMouseLeave={() =>
                    children.length > 0 && scheduleDesktopMenuClose()
                  }
                  onFocus={() =>
                    children.length > 0 && openDesktopMenu(item.href)
                  }
                >
                  <div className="hero__nav-group">
                    <Link
                      className="hero__nav-link"
                      href={item.href}
                      aria-current={current(item.href) ? "page" : undefined}
                      onClick={() => {
                        setMobileOpen(false);
                        closeDesktopMenu();
                      }}
                    >
                      {item.label}
                    </Link>
                    {children.length > 0 && (
                      <button
                        className="hero__nav-toggle"
                        type="button"
                        aria-expanded={open}
                        aria-haspopup="menu"
                        aria-controls={submenuId}
                        aria-label={`Abrir submenu de ${item.label}`}
                        onClick={() =>
                          open ? closeDesktopMenu() : openDesktopMenu(item.href)
                        }
                      >
                        <span className="hero__plus" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {children.length > 0 && (
                    <ul className="nav-submenu" id={submenuId} role="menu">
                      {children.map((child) => (
                        <li
                          className="nav-submenu__item"
                          role="none"
                          key={child.href}
                        >
                          <Link
                            className="nav-submenu__link"
                            href={child.href}
                            role="menuitem"
                            aria-current={
                              current(child.href) ? "page" : undefined
                            }
                            onClick={closeDesktopMenu}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div
        className={classNames(
          "mobile-static-nav",
          staticMobileOpen && "is-open",
          mobileScrolled && "is-scrolled"
        )}
      >
        <div className="mobile-static-nav__bar">
          <Link
            className="mobile-static-nav__logo"
            href="/#hero"
            aria-label="Casa Rosier"
            onClick={() => {
              setStaticMobileOpen(false);
              setMobileOpen(false);
            }}
          >
            {heroMenuColor ? (
              <span className="mobile-static-nav__logo-tint" style={scrollLogoTintStyle} aria-hidden="true" />
            ) : (
              <img
                className="mobile-static-nav__logo-image"
                src={logoUrl}
                alt="Casa Rosier"
              />
            )}
          </Link>
          <button
            className="mobile-static-nav__toggle"
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-scroll-menu"
            aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
            onClick={() => {
              setStaticMobileOpen(false);
              setMobileOpen((open) => !open);
            }}
          >
            <span className="mobile-scroll-nav__icon" aria-hidden="true" />
          </button>
        </div>

        <nav
          id="mobile-static-menu"
          className="mobile-static-menu"
          aria-label="Principal movil"
          hidden={!staticMobileOpen}
        >
          <ul className="mobile-menu__list">
            {mobileItems.map((item, index) => {
              const children =
                item.children?.filter((child) => child.visible) ?? [];
              const open = mobileAccordion === item.label;
              const submenuId = `mobile-static-submenu-${index}`;
              return (
                <li
                  className={classNames(
                    "mobile-menu__item",
                    open && "mobile-menu__item--open"
                  )}
                  key={item.label}
                >
                  <div className="mobile-menu__row">
                    <Link
                      className="mobile-menu__link"
                      href={item.href}
                      aria-current={current(item.href) ? "page" : undefined}
                      onClick={() => setStaticMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {children.length > 0 && (
                      <button
                        className="mobile-menu__toggle"
                        type="button"
                        aria-expanded={open}
                        aria-controls={submenuId}
                        aria-label={`Abrir submenu de ${item.label}`}
                        onClick={() =>
                          setMobileAccordion(open ? null : item.label)
                        }
                      >
                        <span aria-hidden="true">{open ? "x" : "+"}</span>
                      </button>
                    )}
                  </div>
                  {children.length > 0 && (
                    <div className="mobile-submenu" id={submenuId}>
                      <div className="mobile-submenu__inner">
                        <ul className="mobile-submenu__list">
                          {children.map((child) => (
                            <li key={child.href}>
                              <Link
                                className="mobile-submenu__link"
                                href={child.href}
                                aria-current={
                                  current(child.href) ? "page" : undefined
                                }
                                onClick={() => setStaticMobileOpen(false)}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div
        className={classNames(
          "mobile-scroll-nav",
          (mobileScrolled || mobileOpen) && "is-visible",
          mobileOpen && "is-open"
        )}
      >
        <div className="mobile-scroll-nav__bar">
          <Link
            className="mobile-scroll-nav__logo"
            href="/#hero"
            aria-label="Casa Rosier"
            onClick={() => setMobileOpen(false)}
          >
            {scrollMenuLogoTintEnabled ? (
              <span
                className="mobile-scroll-nav__logo-tint"
                style={scrollLogoTintStyle}
                aria-hidden="true"
              />
            ) : (
              <img
                className="mobile-scroll-nav__logo-image"
                src={logoUrl}
                alt="Casa Rosier"
              />
            )}
          </Link>
          <nav className="scroll-desktop-nav" aria-label="Principal">
            <ul className="scroll-desktop-nav__list">
              {scrollDesktopItems.map((item, index) => {
                const open = scrollDesktopOpen === item.href;
                const children = item.children ?? [];
                return (
                  <li
                    className={classNames(
                      "scroll-desktop-nav__item",
                      children.length > 0 &&
                        "scroll-desktop-nav__item--has-children",
                      open && "is-open"
                    )}
                    key={item.href}
                    onMouseEnter={() =>
                      children.length > 0 &&
                      openScrollDesktopMenu(item.href)
                    }
                    onMouseLeave={() =>
                      children.length > 0 &&
                      scheduleScrollDesktopMenuClose()
                    }
                    onFocus={() =>
                      children.length > 0 &&
                      openScrollDesktopMenu(item.href)
                    }
                  >
                    <Link
                      className="scroll-desktop-nav__link"
                      href={item.href}
                      aria-current={current(item.href) ? "page" : undefined}
                      onClick={closeScrollDesktopMenu}
                    >
                      {item.label}
                      {children.length > 0 && (
                        <span
                          className="scroll-desktop-nav__plus"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      )}
                    </Link>
                    {children.length > 0 && (
                      <ul className="scroll-desktop-submenu" role="menu">
                        {children.map((child) => (
                          <li
                            className="scroll-desktop-submenu__item"
                            role="none"
                            key={child.href}
                          >
                            <Link
                              className="scroll-desktop-submenu__link"
                              href={child.href}
                              role="menuitem"
                              aria-current={
                                current(child.href) ? "page" : undefined
                              }
                              onClick={closeScrollDesktopMenu}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {index < scrollDesktopItems.length - 1 && (
                      <span
                        className="scroll-desktop-nav__separator"
                        aria-hidden="true"
                      >
                        |
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          <button
            className="mobile-scroll-nav__toggle"
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-scroll-menu"
            aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="mobile-scroll-nav__icon" aria-hidden="true" />
          </button>
        </div>

        <nav
          id="mobile-scroll-menu"
          className="mobile-scroll-menu"
          aria-label="Principal movil"
          hidden={!mobileOpen}
        >
          <ul className="mobile-menu__list">
            {mobileItems.map((item, index) => {
              const children =
                item.children?.filter((child) => child.visible) ?? [];
              const open = mobileAccordion === item.label;
              const submenuId = `mobile-submenu-${index}`;
              return (
                <li
                  className={classNames(
                    "mobile-menu__item",
                    open && "mobile-menu__item--open"
                  )}
                  key={item.label}
                >
                  <div className="mobile-menu__row">
                    <Link
                      className="mobile-menu__link"
                      href={item.href}
                      aria-current={current(item.href) ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {children.length > 0 && (
                      <button
                        className="mobile-menu__toggle"
                        type="button"
                        aria-expanded={open}
                        aria-controls={submenuId}
                        aria-label={`Abrir submenu de ${item.label}`}
                        onClick={() =>
                          setMobileAccordion(open ? null : item.label)
                        }
                      >
                        <span aria-hidden="true">{open ? "x" : "+"}</span>
                      </button>
                    )}
                  </div>
                  {children.length > 0 && (
                    <div className="mobile-submenu" id={submenuId}>
                      <div className="mobile-submenu__inner">
                        <ul className="mobile-submenu__list">
                          {children.map((child) => (
                            <li key={child.href}>
                              <Link
                                className="mobile-submenu__link"
                                href={child.href}
                                aria-current={
                                  current(child.href) ? "page" : undefined
                                }
                                onClick={() => setMobileOpen(false)}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
