import { chromium } from "playwright-core";
import fs from "node:fs/promises";

const edgePath =
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const pages = [
  {
    name: "Inicio",
    original: "/",
    next: "/",
    selectors: [
      "body",
      ".hero__title",
      ".hero__nav-link",
      ".nav-mobile",
      ".intro-slider-content__text",
      ".intro-slider-content__button",
      ".section-title",
      ".section-subtitle",
      ".content-card__meta",
      ".content-card__title",
      ".content-card__excerpt",
      ".content-card__cta",
      ".testimonial__quote",
      ".testimonial__author",
      ".contact-form label",
      ".contact-form__input",
      ".contact-info__title"
    ]
  },
  {
    name: "Clases",
    original: "/clases/",
    next: "/clases",
    selectors: [
      "body",
      ".hero__nav-link",
      ".page-hero__eyebrow",
      ".page-hero__title",
      ".featured__lede",
      ".content-card__meta",
      ".content-card__title",
      ".content-card__excerpt",
      ".content-card__cta"
    ]
  },
  {
    name: "Detalle clase",
    original: "/clases/primer-contacto-con-torno/",
    next: "/clases/primer-contacto-con-torno",
    selectors: [
      "body",
      ".page-hero__eyebrow",
      ".page-hero__title",
      ".class-detail__eyebrow",
      ".class-detail__title",
      ".class-detail__question",
      ".class-detail__highlight",
      ".class-detail__copy p",
      ".class-detail__fact-block h2",
      ".class-detail__price-row",
      ".class-detail__button",
      ".course-accordion__trigger",
      ".course-accordion__content"
    ]
  },
  {
    name: "Workshops",
    original: "/workshops/",
    next: "/workshops",
    selectors: [
      "body",
      ".page-hero__eyebrow",
      ".page-hero__title",
      ".featured__lede",
      ".content-card__title",
      ".content-card__excerpt"
    ]
  },
  {
    name: "Detalle workshop",
    original: "/workshops/gran-formato/",
    next: "/workshops/gran-formato",
    selectors: [
      "body",
      ".page-hero__title",
      ".class-detail__title",
      ".class-detail__copy p",
      ".course-accordion__trigger"
    ]
  },
  {
    name: "Reservas privadas",
    original: "/reservas-privadas/",
    next: "/reservas-privadas",
    selectors: [
      "body",
      ".page-hero__eyebrow",
      ".page-hero__title",
      ".featured__lede",
      ".content-card__title",
      ".content-card__excerpt"
    ]
  },
  {
    name: "Detalle reserva privada",
    original: "/reservas-privadas/experiencia-para-dos/",
    next: "/reservas-privadas/experiencia-para-dos",
    selectors: [
      "body",
      ".page-hero__title",
      ".class-detail__title",
      ".class-detail__highlight",
      ".class-detail__copy p"
    ]
  },
  {
    name: "Gift Card",
    original: "/gift-card/",
    next: "/gift-card",
    selectors: [
      "body",
      ".page-hero__eyebrow",
      ".page-hero__title",
      ".featured__lede",
      ".content-card__title",
      ".content-card__excerpt"
    ]
  },
  {
    name: "Detalle gift card",
    original: "/gift-card/beginner-class/",
    next: "/gift-card/beginner-class",
    selectors: [
      "body",
      ".page-hero__title",
      ".class-detail__title",
      ".gift-card-selector__label",
      ".gift-card-selector__input",
      ".class-detail__button"
    ]
  },
  {
    name: "Shop",
    original: "/shop/",
    next: "/shop",
    selectors: [
      "body",
      ".hero__nav-link",
      ".shop-filter",
      ".content-card__meta",
      ".content-card__title",
      ".shop-card__price",
      ".shop-card__availability",
      ".shop-card__cta"
    ]
  },
  {
    name: "Detalle shop",
    original: "/shop/taza-irregular-azul/",
    next: "/shop/taza-irregular-azul",
    selectors: [
      "body",
      ".page-hero__title",
      ".shop-detail__eyebrow",
      ".shop-detail__title",
      ".shop-detail__price-main",
      ".shop-detail__highlight",
      ".shop-detail__spec-row",
      ".shop-detail__button"
    ]
  },
  {
    name: "Blog",
    original: "/blog/",
    next: "/blog",
    selectors: [
      "body",
      ".blog-intro__container h2",
      ".blog-intro__container p",
      ".blog-featured__title",
      ".featured-slide__category",
      ".featured-slide__main-title",
      ".featured-slide__excerpt",
      ".blog-filter",
      ".blog-card__title",
      ".blog-card__excerpt",
      ".blog-card__meta"
    ]
  },
  {
    name: "Detalle blog",
    original: "/blog/como-empezar-una-pieza-sin-tenerlo-todo-claro/",
    next: "/blog/como-empezar-una-pieza-sin-tenerlo-todo-claro",
    selectors: [
      "body",
      ".blog-post-hero__category",
      ".blog-hero__title",
      ".blog-post-hero__meta",
      ".blog-post__article-title",
      ".blog-post__excerpt",
      ".blog-post__content p",
      ".blog-post__content h2",
      ".blog-post__quote",
      ".blog-post__button"
    ]
  },
  {
    name: "Carrito",
    original: "/carrito/",
    next: "/carrito",
    selectors: [
      "body",
      ".page-hero__eyebrow",
      ".page-hero__title",
      ".cart__empty h2",
      ".cart__empty p",
      ".class-detail__button"
    ]
  },
  {
    name: "El estudio",
    original: "/el-estudio/",
    next: "/el-estudio",
    selectors: [
      "body",
      ".hero__nav-link",
      ".studio-editorial-intro__eyebrow",
      ".studio-editorial-intro__text",
      ".studio-narrative__copy h2",
      ".studio-narrative__role",
      ".studio-narrative__copy p",
      ".studio-gallery__head h2",
      ".studio-gallery__head p",
      ".studio-closing__text",
      ".studio-closing__button"
    ]
  },
  {
    name: "Política privacidad",
    original: "/politica-privacidad.html",
    next: "/politica-privacidad",
    selectors: ["body", ".privacy h1", ".privacy h2", ".privacy p", ".privacy li"]
  }
];

function role(fontFamily) {
  const value = fontFamily.toLowerCase();
  if (value.includes("baskervville")) return "display";
  if (value.includes("nunito")) return "menu";
  if (value.includes("inter")) return "inter";
  if (value.includes("serif") && !value.includes("sans-serif")) return "serif-fallback";
  if (value.includes("sans-serif")) return "sans-fallback";
  return "unknown";
}

function simplified(style) {
  if (!style) return null;
  return {
    role: role(style.fontFamily),
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform
  };
}

async function collect(page, baseUrl, route, selectors) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  const result = {};
  for (const selector of selectors) {
    result[selector] = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const isHidden =
        cs.display === "none" ||
        cs.visibility === "hidden" ||
        (rect.width <= 1 && rect.height <= 1 && cs.position === "absolute");
      if (isHidden) return null;
      return {
        text: el.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "",
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform
      };
    }, selector);
  }
  return result;
}

function compare(original, next) {
  const rows = [];
  for (const [selector, originalStyle] of Object.entries(original)) {
    const nextStyle = next[selector];
    if (!originalStyle || !nextStyle) continue;
    const o = simplified(originalStyle);
    const n = simplified(nextStyle);
    rows.push({
      selector,
      original: o,
      next: n,
      ok:
        Boolean(o) &&
        Boolean(n) &&
        o.role === n.role &&
        o.fontSize === n.fontSize &&
        o.fontWeight === n.fontWeight &&
        o.lineHeight === n.lineHeight &&
        o.letterSpacing === n.letterSpacing &&
        o.textTransform === n.textTransform
    });
  }
  return rows;
}

const browser = await chromium.launch({
  executablePath: edgePath,
  headless: true
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 1400 },
  deviceScaleFactor: 1
});

const page = await context.newPage();
const report = [];

for (const item of pages) {
  const original = await collect(
    page,
    "http://localhost:4173",
    item.original,
    item.selectors
  );
  const next = await collect(
    page,
    "http://localhost:3000",
    item.next,
    item.selectors
  );
  report.push({
    name: item.name,
    originalRoute: item.original,
    nextRoute: item.next,
    rows: compare(original, next)
  });
}

await browser.close();

await fs.mkdir("reports", { recursive: true });
await fs.writeFile(
  "reports/typography-audit.json",
  JSON.stringify(report, null, 2)
);

let markdown = "# Auditoría de tipografía original vs Next\n\n";
for (const pageReport of report) {
  const mismatches = pageReport.rows.filter((row) => !row.ok);
  markdown += `## ${pageReport.name}\n\n`;
  markdown += `Original: \`${pageReport.originalRoute}\` · Next: \`${pageReport.nextRoute}\`\n\n`;
  markdown += `Coincidencias: ${pageReport.rows.length - mismatches.length}/${pageReport.rows.length}\n\n`;
  if (mismatches.length) {
    markdown += "| Selector | Original | Next |\n| --- | --- | --- |\n";
    for (const row of mismatches) {
      const o = row.original
        ? `${row.original.role}; ${row.original.fontSize}; ${row.original.fontWeight}; ${row.original.lineHeight}; ${row.original.letterSpacing}`
        : "NO ENCONTRADO";
      const n = row.next
        ? `${row.next.role}; ${row.next.fontSize}; ${row.next.fontWeight}; ${row.next.lineHeight}; ${row.next.letterSpacing}`
        : "NO ENCONTRADO";
      markdown += `| \`${row.selector}\` | ${o} | ${n} |\n`;
    }
    markdown += "\n";
  }
}

await fs.writeFile("reports/typography-audit.md", markdown);
console.log(markdown);
