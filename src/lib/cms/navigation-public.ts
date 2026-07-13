import type { NavigationItem } from "@/data/types";
import { experienceHref } from "@/lib/routes";
import { getMenuByLocation } from "./menus";
import { getOfferings } from "./offerings";
import type { MenuItem, Offering } from "./types";

type DynamicMenuKey = "classes" | "workshops" | "privateBookings" | "giftCards";
const PUBLIC_NAV_CACHE_TTL_MS = Number(process.env.CMS_PUBLIC_NAV_CACHE_MS ?? 15_000);
const publicNavigationCache = new Map<string, { items: NavigationItem[]; expiresAt: number }>();

const dynamicMenuConfig: Record<DynamicMenuKey, {
  label: string;
  href: string;
  offeringType: Offering["type"];
  order: number;
}> = {
  classes: { label: "Clases", href: "/clases", offeringType: "class", order: 1 },
  workshops: { label: "Workshops", href: "/workshops", offeringType: "workshop", order: 2 },
  privateBookings: { label: "Experiencias", href: "/experiencias", offeringType: "experience", order: 3 },
  giftCards: { label: "Gift Cards", href: "/gift-cards", offeringType: "gift_card", order: 4 },
};

const staticFallbackItems: NavigationItem[] = [
  { label: "Inicio", href: "/#hero", order: 0, visible: true },
  ...Object.values(dynamicMenuConfig).map((item) => ({
    label: item.label,
    href: item.href,
    order: item.order,
    visible: true,
    children: [],
  })),
  {
    label: "El Estudio",
    href: "/el-estudio",
    order: 5,
    visible: true,
    children: [
      { label: "El Estudio", href: "/el-estudio", order: 0, visible: true },
      { label: "Bitácora", href: "/blog", order: 1, visible: true },
    ],
  },
  { label: "Shop", href: "/shop", order: 6, visible: true },
];

export function invalidatePublicNavigationCache() {
  publicNavigationCache.clear();
}

function getCachedPublicNavigation(location: string) {
  const cached = publicNavigationCache.get(location);
  if (!cached || cached.expiresAt <= Date.now()) return null;
  return cached.items;
}

function cachePublicNavigation(location: string, items: NavigationItem[]) {
  publicNavigationCache.set(location, {
    items,
    expiresAt: Date.now() + PUBLIC_NAV_CACHE_TTL_MS,
  });
  return items;
}

function hrefForItem(item: MenuItem) {
  return item.url || "/";
}

function toNavigationItem(item: MenuItem, children: MenuItem[]): NavigationItem {
  return {
    label: item.label,
    href: hrefForItem(item),
    order: item.sort_order,
    visible: item.is_visible,
    target: item.open_in_new_tab ? "_blank" : undefined,
    children: children
      .filter((child) => child.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((child) => toNavigationItem(child, [])),
  };
}

function kindForOffering(type: Offering["type"]) {
  if (type === "workshop") return "workshop";
  if (type === "experience") return "private-booking";
  if (type === "gift_card") return "gift-card";
  return "class";
}

function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dynamicKeyForItem(item: NavigationItem): DynamicMenuKey | null {
  const byHref = (Object.entries(dynamicMenuConfig) as [DynamicMenuKey, typeof dynamicMenuConfig[DynamicMenuKey]][])
    .find(([, config]) => item.href === config.href);
  if (byHref) return byHref[0];

  const label = normalizeLabel(item.label);
  if (label === "clases" || label === "classes") return "classes";
  if (label === "workshops") return "workshops";
  if (item.href === "/reservas-privadas" || label === "reservas privadas" || label === "experiencias") return "privateBookings";
  if (
    item.href === "/gift-card" ||
    label === "tarjeta de regalo" ||
    label === "tarjetas de regalo" ||
    label === "targetas de regalo" ||
    label === "gift cards" ||
    label === "giftcards"
  ) return "giftCards";
  return null;
}

function labelForDynamicItem(item: NavigationItem, key: DynamicMenuKey) {
  const label = normalizeLabel(item.label);
  if (key === "privateBookings" && label === "reservas privadas") {
    return dynamicMenuConfig[key].label;
  }
  if (
    key === "giftCards" &&
    (label === "tarjeta de regalo" ||
      label === "tarjetas de regalo" ||
      label === "targetas de regalo")
  ) {
    return dynamicMenuConfig[key].label;
  }
  return item.label;
}

function isStudioItem(item: NavigationItem) {
  return item.href === "/el-estudio" || normalizeLabel(item.label) === "el estudio";
}

function isLegacyBlogRootItem(item: NavigationItem) {
  const label = normalizeLabel(item.label);
  return item.href === "/blog" && (label === "blog" || label === "bitacora");
}

function ensureStudioSubmenu(children: NavigationItem[] = []) {
  const byHref = new Map(children.map((child) => [child.href, child]));
  const normalized = children.map((child, index) => ({ ...child, order: child.order ?? index }));
  const nextOrder = normalized.length ? Math.max(...normalized.map((child) => child.order)) + 1 : 0;
  const additions: NavigationItem[] = [];

  if (!byHref.has("/el-estudio")) {
    additions.push({ label: "El Estudio", href: "/el-estudio", order: nextOrder, visible: true });
  }
  if (!byHref.has("/blog")) {
    additions.push({ label: "Bitácora", href: "/blog", order: nextOrder + additions.length, visible: true });
  }

  return [
    ...normalized.map((child) => {
      if (child.href === "/el-estudio") return { ...child, label: child.label || "El Estudio", visible: true };
      if (child.href === "/blog") return { ...child, label: child.label || "Bitácora", visible: true };
      return child;
    }),
    ...additions,
  ].sort((a, b) => a.order - b.order);
}

function normalizePublicMenuStructure(items: NavigationItem[]) {
  const hasShop = items.some((item) => item.href === "/shop");
  return items
    .flatMap((item) => {
      if (!isLegacyBlogRootItem(item)) return [item];
      return hasShop ? [] : [{ ...item, label: "Shop", href: "/shop", children: [] }];
    })
    .map((item) => (
      isStudioItem(item)
        ? { ...item, label: "El Estudio", children: ensureStudioSubmenu(item.children) }
        : item
    ))
    .sort((a, b) => a.order - b.order);
}

function offeringToNavigationItem(offering: Offering, order: number): NavigationItem {
  return {
    label: offering.title,
    href: experienceHref(kindForOffering(offering.type), offering.slug),
    order,
    visible: true,
  };
}

function mergeGeneratedChildrenWithSavedOrder(generated: NavigationItem[], saved: NavigationItem[] = []) {
  if (!saved.length) return generated;

  const generatedByHref = new Map(generated.map((child) => [child.href, child]));
  const usedHrefs = new Set<string>();
  const merged: NavigationItem[] = [];

  saved
    .filter((child) => child.visible)
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((child) => {
      const generatedChild = generatedByHref.get(child.href);
      if (generatedChild) usedHrefs.add(child.href);
      merged.push({
        ...(generatedChild ?? child),
        label: child.label || generatedChild?.label || "",
        href: child.href,
        visible: child.visible,
        target: child.target ?? generatedChild?.target,
      });
    });

  generated.forEach((child) => {
    if (!usedHrefs.has(child.href)) merged.push(child);
  });

  return merged.map((child, index) => ({ ...child, order: index }));
}

async function getDynamicChildrenByKey() {
  const offerings = await getOfferings();
  const published = offerings
    .filter((offering) => offering.status === "published" && !offering.deleted_at && offering.slug)
    .sort((a, b) => a.title.localeCompare(b.title));

  return (Object.entries(dynamicMenuConfig) as [DynamicMenuKey, typeof dynamicMenuConfig[DynamicMenuKey]][])
    .reduce((acc, [key, config]) => {
      acc[key] = published
        .filter((offering) => offering.type === config.offeringType)
        .map(offeringToNavigationItem);
      return acc;
    }, {} as Record<DynamicMenuKey, NavigationItem[]>);
}

function withDynamicChildren(items: NavigationItem[], dynamicChildren: Record<DynamicMenuKey, NavigationItem[]>) {
  const seen = new Set<DynamicMenuKey>();
  const enhanced = items.map((item) => {
    const key = dynamicKeyForItem(item);
    if (!key) return item;
    seen.add(key);
    return {
      ...item,
      label: labelForDynamicItem(item, key),
      href: dynamicMenuConfig[key].href,
      children: mergeGeneratedChildrenWithSavedOrder(dynamicChildren[key], item.children),
    };
  });

  for (const key of Object.keys(dynamicMenuConfig) as DynamicMenuKey[]) {
    if (seen.has(key)) continue;
    const config = dynamicMenuConfig[key];
    enhanced.push({
      label: config.label,
      href: config.href,
      order: config.order,
      visible: true,
      children: dynamicChildren[key],
    });
  }

  return normalizePublicMenuStructure(enhanced);
}

export async function getPublicNavigationItems(location: "main" | "mobile" | "footer" = "main") {
  const cached = getCachedPublicNavigation(location);
  if (cached) return cached;

  const dynamicChildren = location === "footer" ? null : await getDynamicChildrenByKey();
  const menu = await getMenuByLocation(location);
  if (!menu) return cachePublicNavigation(location, dynamicChildren ? withDynamicChildren(staticFallbackItems, dynamicChildren) : []);

  const childrenByParent = new Map<string, MenuItem[]>();
  for (const item of menu.items) {
    if (!item.parent_id) continue;
    const current = childrenByParent.get(item.parent_id) ?? [];
    current.push(item);
    childrenByParent.set(item.parent_id, current);
  }

  const items = menu.items
    .filter((item) => item.is_visible && !item.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => toNavigationItem(item, childrenByParent.get(item.id) ?? []));

  if (dynamicChildren) {
    return cachePublicNavigation(location, withDynamicChildren(items.length ? items : staticFallbackItems, dynamicChildren));
  }

  return cachePublicNavigation(location, location === "footer" ? items : normalizePublicMenuStructure(items));
}
