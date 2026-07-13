import type { PromoBanner, SocialGallery, Testimonial } from "./types";
import { getActivePromoBanner } from "./promo-banners";
import { getSocialGalleries } from "./social-galleries";
import { getTestimonials } from "./testimonials";
import { readJsonFile } from "./local-storage";

const CACHE_TTL_MS = 60_000;
const PUBLIC_DATA_TIMEOUT_MS = 1_500;

type CacheEntry<T> = {
  expiresAt: number;
  promise: Promise<T>;
};

const publicCache = new Map<string, CacheEntry<unknown>>();

export function invalidatePublicContentCache() {
  publicCache.delete("public-promo-banner");
  publicCache.delete("public-home-content");
  publicCache.delete("public-social-gallery");
  publicCache.delete("public-testimonials");
}

function cached<T>(key: string, loader: () => Promise<T>, ttlMs = CACHE_TTL_MS) {
  const now = Date.now();
  const current = publicCache.get(key) as CacheEntry<T> | undefined;

  if (current && current.expiresAt > now) {
    return current.promise;
  }

  const promise = loader().catch((error) => {
    publicCache.delete(key);
    throw error;
  });
  publicCache.set(key, { expiresAt: now + ttlMs, promise });
  return promise;
}

async function withFallback<T>(
  loader: () => Promise<T>,
  fallback: () => Promise<T>,
  timeoutMs = PUBLIC_DATA_TIMEOUT_MS,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const loaderPromise = loader().catch(fallback);
  const timeoutPromise = new Promise<T>((resolve) => {
    timeout = setTimeout(() => {
      void fallback().then(resolve);
    }, timeoutMs);
  });

  try {
    return await Promise.race([loaderPromise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function getLocalSocialGalleries() {
  return readJsonFile<SocialGallery[]>("social-galleries.json", []);
}

async function getLocalTestimonials() {
  return readJsonFile<Testimonial[]>("testimonials.json", []);
}

async function getLocalPromoBanners() {
  return readJsonFile<PromoBanner[]>("promo-banners.json", []);
}

function getActiveBannerFromItems(items: PromoBanner[]) {
  const now = new Date();
  return items
    .filter((item) => {
      if (item.status === "deleted" || item.deleted_at) return false;
      if (item.status !== "published") return false;
      if (item.start_date && new Date(item.start_date) > now) return false;
      if (item.end_date && new Date(item.end_date) < now) return false;
      return true;
    })
    .sort((a, b) => +new Date(b.updated_at || b.created_at) - +new Date(a.updated_at || a.created_at))[0] ?? null;
}

export function getPublicSocialGallery(): Promise<SocialGallery | null> {
  return cached("public-social-gallery", () =>
    withFallback(getSocialGalleries, getLocalSocialGalleries).then((galleries) =>
      galleries
        .filter((item) => item.deleted_at === null)
        .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0] ?? null,
    ),
  );
}

export function getPublicTestimonials(): Promise<Testimonial[]> {
  return cached("public-testimonials", async () => {
    const testimonials = await withFallback(getTestimonials, getLocalTestimonials);
    return testimonials
      .filter((item) => item.status === "published" && item.deleted_at === null)
      .sort((a, b) => a.sort_order - b.sort_order);
  });
}

export function getPublicPromoBanner(): Promise<PromoBanner | null> {
  return cached("public-promo-banner", () =>
    withFallback(getActivePromoBanner, async () => getActiveBannerFromItems(await getLocalPromoBanners())),
  );
}

export function getPublicHomeContent() {
  return cached("public-home-content", async () => {
    const [promoBanner, testimonials, socialGallery] = await Promise.all([
      getPublicPromoBanner(),
      getPublicTestimonials(),
      getPublicSocialGallery(),
    ]);

    return { promoBanner, testimonials, socialGallery };
  });
}
