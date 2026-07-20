type TextAlign = "left" | "center" | "right" | "justify";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function normalizeEditorUrl(value: string) {
  const trimmed = value.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return "";
}

function normalizeTextAlign(value: string | null | undefined): TextAlign {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (trimmed === "center" || trimmed === "right" || trimmed === "justify") return trimmed;
  return "left";
}

function alignedHtmlTag(tag: string, align: TextAlign, content: string) {
  const safeTag = tag === "div" ? "p" : tag.toLowerCase();
  const safeAlign = normalizeTextAlign(align);
  return `<${safeTag} style="text-align: ${safeAlign}">${content}</${safeTag}>`;
}

function getElementAlign(element: HTMLElement): TextAlign {
  return normalizeTextAlign(element.style.textAlign || element.getAttribute("align"));
}

function inlineMarkdownToHtml(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, "<u>$1</u>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text: string, href: string) => {
      const safeHref = normalizeEditorUrl(href);
      return safeHref ? `<a href="${escapeAttribute(safeHref)}">${text}</a>` : text;
    });
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    const content = paragraph.join(" ").trim();
    if (content) html.push(`<p>${inlineMarkdownToHtml(content)}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list?.items.length) {
      list = null;
      return;
    }
    const tag = list.ordered ? "ol" : "ul";
    html.push(`<${tag}>${list.items.map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`).join("")}</${tag}>`);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const alignedTextBlock = line.match(/^<(p|div|h[1-3])\s+style=["'][^"']*text-align:\s*(left|center|right|justify);?[^"']*["'][^>]*>(.*)<\/\1>$/i);
    if (alignedTextBlock) {
      flushParagraph();
      flushList();
      const tag = alignedTextBlock[1].toLowerCase() === "div" ? "p" : alignedTextBlock[1].toLowerCase();
      html.push(alignedHtmlTag(tag, normalizeTextAlign(alignedTextBlock[2]), inlineMarkdownToHtml(alignedTextBlock[3].trim())));
      continue;
    }

    const alignedListBlock = line.match(/^<(ul|ol)\s+style=["'][^"']*text-align:\s*(left|center|right|justify);?[^"']*["'][^>]*>(.*)<\/\1>$/i);
    if (alignedListBlock) {
      flushParagraph();
      flushList();
      const tag = alignedListBlock[1].toLowerCase();
      const items = Array.from(alignedListBlock[4].matchAll(/<li[^>]*>(.*?)<\/li>/gi)).map((item) => item[1].trim()).filter(Boolean);
      if (items.length) html.push(`<${tag} style="text-align: ${normalizeTextAlign(alignedListBlock[2])}">${items.map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`).join("")}</${tag}>`);
      continue;
    }

    const iframeMatch = line.match(/^<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/iframe>$/i);
    if (iframeMatch) {
      flushParagraph();
      flushList();
      const src = normalizeEditorUrl(iframeMatch[1]);
      if (src) html.push(`<iframe src="${escapeAttribute(src)}" title="Contenido embebido"></iframe>`);
      continue;
    }

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      const src = normalizeEditorUrl(imageMatch[2]);
      if (src) html.push(`<img src="${escapeAttribute(src)}" alt="${escapeAttribute(imageMatch[1])}">`);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${inlineMarkdownToHtml(quote[1].trim())}</blockquote>`);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdownToHtml(heading[2].trim())}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const orderedList = Boolean(ordered);
      if (!list || list.ordered !== orderedList) {
        flushList();
        list = { ordered: orderedList, items: [] };
      }
      list.items.push((unordered?.[1] ?? ordered?.[1] ?? "").trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("") || "<p></p>";
}

function textFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const element = node as HTMLElement;
  const content = Array.from(element.childNodes).map(textFromNode).join("");
  const tag = element.tagName.toLowerCase();

  if (tag === "strong" || tag === "b") return `**${content}**`;
  if (tag === "em" || tag === "i") return `_${content}_`;
  if (tag === "u") return `<u>${content}</u>`;
  if (tag === "s" || tag === "strike" || tag === "del") return `~~${content}~~`;
  if (tag === "a") {
    const href = normalizeEditorUrl(element.getAttribute("href") ?? "");
    return href ? `[${content || href}](${href})` : content;
  }
  if (tag === "br") return "\n";
  return content;
}

export function htmlRootToMarkdown(root: HTMLElement) {
  const blocks: string[] = [];
  const inline = (element: Element) => Array.from(element.childNodes).map(textFromNode).join("").trim();
  const listHtml = (element: HTMLElement, tag: "ul" | "ol") => {
    const items = Array.from(element.children).filter((child) => child.tagName.toLowerCase() === "li").map((child) => `<li>${inline(child)}</li>`).join("");
    return items ? alignedHtmlTag(tag, getElementAlign(element), items) : "";
  };

  const serializeBlock = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").trim();
      if (text) blocks.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      const value = inline(element);
      const align = getElementAlign(element);
      if (align !== "left") blocks.push(alignedHtmlTag(tag, align, value));
      else blocks.push(`${"#".repeat(Number(tag.slice(1)))} ${value}`);
      return;
    }

    if (tag === "ul" || tag === "ol") {
      const align = getElementAlign(element);
      if (align !== "left") {
        const value = listHtml(element, tag);
        if (value) blocks.push(value);
        return;
      }
      const items = Array.from(element.children).map((child, index) => {
        const prefix = tag === "ol" ? `${index + 1}. ` : "- ";
        const value = inline(child);
        return value ? `${prefix}${value}` : "";
      }).filter(Boolean);
      if (items.length) blocks.push(items.join("\n"));
      return;
    }

    if (tag === "img") {
      const src = normalizeEditorUrl(element.getAttribute("src") ?? "");
      if (src) blocks.push(`![${element.getAttribute("alt") ?? ""}](${src})`);
      return;
    }

    if (tag === "iframe") {
      const src = normalizeEditorUrl(element.getAttribute("src") ?? "");
      if (src) blocks.push(`<iframe src="${src}"></iframe>`);
      return;
    }

    if (tag === "p" || tag === "div" || tag === "blockquote") {
      const embeddedImage = element.querySelector(":scope > img");
      if (embeddedImage) {
        serializeBlock(embeddedImage);
        return;
      }
      const embeddedFrame = element.querySelector(":scope > iframe");
      if (embeddedFrame) {
        serializeBlock(embeddedFrame);
        return;
      }
      const value = inline(element);
      if (value) {
        const align = getElementAlign(element);
        if (tag !== "blockquote" && align !== "left") blocks.push(alignedHtmlTag("p", align, value));
        else blocks.push(tag === "blockquote" ? `> ${value}` : value);
      }
      return;
    }

    Array.from(element.childNodes).forEach(serializeBlock);
  };

  Array.from(root.childNodes).forEach(serializeBlock);
  return blocks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function htmlStringToMarkdown(html: string) {
  if (typeof document === "undefined") return "";
  const container = document.createElement("div");
  container.innerHTML = html;
  return htmlRootToMarkdown(container);
}
