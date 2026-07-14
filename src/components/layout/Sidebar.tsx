"use client";

import { useState } from "react";
import Link from "@/components/admin/AdminLink";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { adminSections } from "@/lib/admin/navigation";

interface SidebarProps {
  userName: string;
  userEmail: string;
  appVersion: string;
}

export default function Sidebar({ userName, userEmail, appVersion }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [collapsedActive, setCollapsedActive] = useState<string[]>([]);
  const userInitial = (userName || userEmail || "A").trim().charAt(0).toUpperCase();

  const toggleGroup = (key: string) => {
    const section = adminSections.find((item) => item.label === key);
    const children = section?.children ?? [];
    const active = isChildActive(children);

    if (active) {
      setCollapsedActive((prev) =>
        prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
      );
      return;
    }

    setExpanded((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const getHrefPath = (href: string) => href.split("?")[0];

  const isActive = (href: string) => pathname === getHrefPath(href);

  const isChildActive = (children: { href: string }[]) =>
    children.some((child) => pathname.startsWith(getHrefPath(child.href)));

  return (
    <aside className="admin-sidebar">
      <header className="admin-sidebar__header">
        <div className="admin-sidebar__avatar-wrap">
          <div className="admin-sidebar__avatar">
            {userInitial}
          </div>
          <span className="admin-sidebar__online" />
        </div>
        <div className="admin-sidebar__user">
          <span title={userName}>{userName}</span>
          <small title={userEmail}>{userEmail}</small>
        </div>
      </header>

      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__nav-list">
          {adminSections.map((section) => {
            const children = section.children ?? [];
            const childActive = isChildActive(children);
            const isOpen = childActive
              ? !collapsedActive.includes(section.label)
              : expanded.includes(section.label);

            if (section.href) {
              return (
                <Link
                  key={section.label}
                  href={section.href}
                  className={`admin-sidebar__item ${
                    isActive(section.href)
                      ? "admin-sidebar__item--active"
                      : ""
                  }`}
                >
                  <span className="material-symbols-outlined">{section.icon}</span>
                  <span>{section.label}</span>
                </Link>
              );
            }

            return (
              <div key={section.label}>
                  <button
                    onClick={() => toggleGroup(section.label)}
                    className={`admin-sidebar__item admin-sidebar__item--button ${
                      childActive
                        ? "admin-sidebar__item--active"
                        : ""
                    }`}
                    aria-expanded={isOpen}
                  >
                    <div className="admin-sidebar__item-label">
                      <span className="material-symbols-outlined">{section.icon}</span>
                      <span>{section.label}</span>
                    </div>
                    <span
                      className="material-symbols-outlined admin-sidebar__chevron"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      expand_more
                    </span>
                  </button>
                  <div
                    className={`admin-sidebar__submenu-wrap ${
                      isOpen ? "admin-sidebar__submenu-wrap--open" : ""
                    }`}
                  >
                    <div className="admin-sidebar__submenu">
                      {children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`admin-sidebar__submenu-link ${
                            isActive(child.href)
                              ? "admin-sidebar__submenu-link--active"
                              : ""
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      </nav>

      <footer className="admin-sidebar__footer">
        <div className="admin-sidebar__footer-row">
          <LogoutButton />
          <span className="admin-sidebar__version">{appVersion}</span>
        </div>
      </footer>
    </aside>
  );
}
