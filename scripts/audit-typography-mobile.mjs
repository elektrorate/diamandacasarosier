import { chromium } from "playwright-core";
import fs from "node:fs/promises";

const edgePath =
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const pages = [
  ["/", "/", "Inicio"],
  ["/clases/", "/clases", "Clases"],
  ["/clases/primer-contacto-con-torno/", "/clases/primer-contacto-con-torno", "Detalle clase"],
  ["/shop/", "/shop", "Shop"],
  ["/blog/", "/blog", "Blog"],
  ["/el-estudio/", "/el-estudio", "El estudio"]
];

const selectors = [
  ".nav-mobile",
  ".mobile-menu__link",
  ".mobile-menu__toggle",
  ".mobile-submenu__link",
  ".section-title",
  ".page-hero__title",
  ".content-card__title",
  ".content-card__excerpt",
  ".class-detail__title",
  ".blog-intro__container h2",
  ".studio-editorial-intro__text"
];

async function collect(page, base, route) {
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts?.ready);
  const menu = page.locator(".nav-mobile");
  if ((await menu.count()) > 0) {
    await menu.first().click().catch(() => {});
  }
  await page.waitForTimeout(200);
  const out = {};
  for (const selector of selectors) {
    out[selector] = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return null;
      return {
        role: (() => {
          const value = cs.fontFamily.toLowerCase();
          if (value.includes("baskervville")) return "display";
          if (value.includes("nunito")) return "menu";
          if (value.includes("inter")) return "inter";
          if (value.includes("serif") && !value.includes("sans-serif")) return "serif-fallback";
          if (value.includes("sans-serif")) return "sans-fallback";
          return "unknown";
        })(),
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing
      };
    }, selector);
  }
  return out;
}

const browser = await chromium.launch({
  executablePath: edgePath,
  headless: true
});
const context = await browser.newContext({
  viewport: { width: 390, height: 1200 },
  isMobile: true,
  deviceScaleFactor: 2
});
const page = await context.newPage();
const report = [];

for (const [originalRoute, nextRoute, name] of pages) {
  const original = await collect(page, "http://localhost:4173", originalRoute);
  const next = await collect(page, "http://localhost:3000", nextRoute);
  const rows = [];
  for (const selector of selectors) {
    const o = original[selector];
    const n = next[selector];
    if (!o && !n) continue;
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
        o.letterSpacing === n.letterSpacing
    });
  }
  report.push({ name, rows });
}

await browser.close();

let markdown = "# Auditoría mobile de tipografía original vs Next\n\n";
for (const pageReport of report) {
  const mismatches = pageReport.rows.filter((row) => !row.ok);
  markdown += `## ${pageReport.name}\n\n`;
  markdown += `Coincidencias: ${pageReport.rows.length - mismatches.length}/${pageReport.rows.length}\n\n`;
  if (mismatches.length) {
    markdown += "| Selector | Original | Next |\n| --- | --- | --- |\n";
    for (const row of mismatches) {
      const fmt = (item) =>
        item
          ? `${item.role}; ${item.fontSize}; ${item.fontWeight}; ${item.lineHeight}; ${item.letterSpacing}`
          : "NO ENCONTRADO";
      markdown += `| \`${row.selector}\` | ${fmt(row.original)} | ${fmt(row.next)} |\n`;
    }
    markdown += "\n";
  }
}

await fs.mkdir("reports", { recursive: true });
await fs.writeFile("reports/typography-mobile-audit.json", JSON.stringify(report, null, 2));
await fs.writeFile("reports/typography-mobile-audit.md", markdown);
console.log(markdown);
