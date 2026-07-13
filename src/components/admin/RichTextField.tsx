"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import MediaLibraryModal from "./MediaLibraryModal";

type RichTextControl =
  | "normal"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "h1"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "link"
  | "image"
  | "iframe";

type ImageSourceMode = "library" | "upload" | "url";
type TextAlign = "left" | "center" | "right";

interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  ul: boolean;
  ol: boolean;
  format: "normal" | "h1" | "h2" | "h3";
  align: TextAlign;
}

interface RichTextFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
  controls?: RichTextControl[];
  name?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}

const defaultControls: RichTextControl[] = [
  "normal",
  "h1",
  "h2",
  "h3",
  "bold",
  "italic",
  "underline",
  "strike",
  "ul",
  "ol",
  "alignLeft",
  "alignCenter",
  "alignRight",
  "link",
  "image",
  "iframe",
];

const defaultToolbarState: ToolbarState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  ul: false,
  ol: false,
  format: "normal",
  align: "left",
};

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

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return "";
}

function normalizeTextAlign(value: string | null | undefined): TextAlign {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (trimmed === "center" || trimmed === "right") return trimmed;
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

function formatFromQueryValue(value: string): ToolbarState["format"] {
  const normalized = value.replace(/[<>]/g, "").toLowerCase();
  if (normalized === "h1" || normalized === "h2" || normalized === "h3") return normalized;
  return "normal";
}

function inlineMarkdownToHtml(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, "<u>$1</u>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text: string, href: string) => {
      const safeHref = normalizeUrl(href);
      return safeHref ? `<a href="${escapeAttribute(safeHref)}">${text}</a>` : text;
    });
}

function markdownToHtml(markdown: string) {
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

    const alignedTextBlock = line.match(/^<(p|div|h[1-3])\s+style=["'][^"']*text-align:\s*(left|center|right);?[^"']*["'][^>]*>(.*)<\/\1>$/i);
    if (alignedTextBlock) {
      flushParagraph();
      flushList();
      const tag = alignedTextBlock[1].toLowerCase() === "div" ? "p" : alignedTextBlock[1].toLowerCase();
      html.push(alignedHtmlTag(tag, normalizeTextAlign(alignedTextBlock[2]), inlineMarkdownToHtml(alignedTextBlock[3].trim())));
      continue;
    }

    const alignedListBlock = line.match(/^<(ul|ol)\s+style=["'][^"']*text-align:\s*(left|center|right);?[^"']*["'][^>]*>(.*)<\/\1>$/i);
    if (alignedListBlock) {
      flushParagraph();
      flushList();
      const tag = alignedListBlock[1].toLowerCase();
      const items = Array.from(alignedListBlock[4].matchAll(/<li[^>]*>(.*?)<\/li>/gi))
        .map((item) => item[1].trim())
        .filter(Boolean);
      if (items.length) {
        html.push(`<${tag} style="text-align: ${normalizeTextAlign(alignedListBlock[2])}">${items.map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`).join("")}</${tag}>`);
      }
      continue;
    }

    const iframeMatch = line.match(/^<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/iframe>$/i);
    if (iframeMatch) {
      flushParagraph();
      flushList();
      const src = normalizeUrl(iframeMatch[1]);
      if (src) html.push(`<div class="rich-text-embed" contenteditable="false"><iframe src="${escapeAttribute(src)}" title="Contenido embebido" loading="lazy" allowfullscreen></iframe></div>`);
      continue;
    }

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      const src = normalizeUrl(imageMatch[2]);
      if (src) html.push(`<figure class="rich-text-image" contenteditable="false"><img src="${escapeAttribute(src)}" alt="${escapeAttribute(imageMatch[1])}"></figure>`);
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
  return html.join("") || "<p><br></p>";
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
    const href = normalizeUrl(element.getAttribute("href") ?? "");
    return href ? `[${content || href}](${href})` : content;
  }
  if (tag === "br") return "\n";
  return content;
}

function htmlToMarkdown(root: HTMLElement) {
  const blocks: string[] = [];

  const inline = (element: Element) => Array.from(element.childNodes).map(textFromNode).join("").trim();
  const listHtml = (element: HTMLElement, tag: "ul" | "ol") => {
    const items = Array.from(element.children)
      .filter((child) => child.tagName.toLowerCase() === "li")
      .map((child) => `<li>${inline(child)}</li>`)
      .join("");
    return items ? alignedHtmlTag(tag, getElementAlign(element), items) : "";
  };

  const serializeBlock = (node: Node, listPrefix?: string) => {
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
      if (align === "center" || align === "right") blocks.push(alignedHtmlTag(tag, align, value));
      else blocks.push(`${"#".repeat(Number(tag.slice(1)))} ${value}`);
      return;
    }

    if (tag === "ul" || tag === "ol") {
      const align = getElementAlign(element);
      if (align === "center" || align === "right") {
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

    if (tag === "li") {
      const value = inline(element);
      if (value) blocks.push(`${listPrefix ?? "- "}${value}`);
      return;
    }

    if (tag === "img") {
      const src = normalizeUrl(element.getAttribute("src") ?? "");
      if (src) blocks.push(`![${element.getAttribute("alt") ?? ""}](${src})`);
      return;
    }

    if (tag === "iframe") {
      const src = normalizeUrl(element.getAttribute("src") ?? "");
      if (src) blocks.push(`<iframe src="${src}"></iframe>`);
      return;
    }

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

    if (tag === "p" || tag === "div" || tag === "blockquote") {
      const value = inline(element);
      if (value) {
        const align = getElementAlign(element);
        if (tag !== "blockquote" && (align === "center" || align === "right")) blocks.push(alignedHtmlTag("p", align, value));
        else blocks.push(tag === "blockquote" ? `> ${value}` : value);
      }
      return;
    }

    Array.from(element.childNodes).forEach((child) => serializeBlock(child));
  };

  Array.from(root.childNodes).forEach((node) => serializeBlock(node));
  return blocks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function ToolbarIcon({ name }: { name: "list" | "ordered-list" | "align-left" | "align-center" | "align-right" | "link" | "image" | "code" }) {
  const commonProps = {
    className: "rich-text-field__svg-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  if (name === "list") {
    return (
      <svg {...commonProps}>
        <path d="M8 6h12" />
        <path d="M8 12h12" />
        <path d="M8 18h12" />
        <path d="M4 6h.01" />
        <path d="M4 12h.01" />
        <path d="M4 18h.01" />
      </svg>
    );
  }

  if (name === "ordered-list") {
    return (
      <svg {...commonProps}>
        <path d="M10 6h10" />
        <path d="M10 12h10" />
        <path d="M10 18h10" />
        <path d="M4 6h1v4" />
        <path d="M4 10h2" />
        <path d="M4 14h2l-2 4h2" />
      </svg>
    );
  }

  if (name === "align-left") {
    return (
      <svg {...commonProps}>
        <path d="M4 6h16" />
        <path d="M4 12h10" />
        <path d="M4 18h14" />
      </svg>
    );
  }

  if (name === "align-center") {
    return (
      <svg {...commonProps}>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M5 18h14" />
      </svg>
    );
  }

  if (name === "align-right") {
    return (
      <svg {...commonProps}>
        <path d="M4 6h16" />
        <path d="M10 12h10" />
        <path d="M6 18h14" />
      </svg>
    );
  }

  if (name === "link") {
    return (
      <svg {...commonProps}>
        <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
        <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07" />
      </svg>
    );
  }

  if (name === "image") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m20 15-4.5-4.5L7 19" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
    </svg>
  );
}

function TextIcon({ children, italic, strike }: { children: string; italic?: boolean; strike?: boolean }) {
  return (
    <span className={`rich-text-field__text-icon${italic ? " is-italic" : ""}${strike ? " is-strike" : ""}`} aria-hidden="true">
      {children}
    </span>
  );
}

function ToolButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`rich-text-field__tool${active ? " is-active" : ""}`}
      title={label}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export default function RichTextField({
  label,
  value,
  onChange,
  minHeight = "190px",
  className,
  controls = defaultControls,
  name,
  required,
  maxLength,
  placeholder,
  ...props
}: RichTextFieldProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [imageMode, setImageMode] = useState<ImageSourceMode>("library");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageError, setImageError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [toolbarState, setToolbarState] = useState<ToolbarState>(defaultToolbarState);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isFocused) return;
    const html = markdownToHtml(value);
    if (editor.innerHTML !== html) editor.innerHTML = html;
  }, [isFocused, value]);

  useEffect(() => {
    function handleSelectionChange() {
      if (!isFocused) return;
      updateToolbarState();
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isFocused]);

  useEffect(() => {
    if (!isImageModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeImageModal();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageModalOpen]);

  function rememberSelection() {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const editor = editorRef.current;
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;

    if (editor && container instanceof Node && editor.contains(container)) {
      selectionRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    const range = selectionRangeRef.current;
    if (!selection || !range) return;

    const container = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;

    if (container instanceof Node && editor.contains(container)) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  function emitChange() {
    const editor = editorRef.current;
    if (!editor) return;
    const nextValue = htmlToMarkdown(editor);
    if (maxLength && nextValue.length > maxLength) {
      onChange(nextValue.slice(0, maxLength));
      editor.innerHTML = markdownToHtml(nextValue.slice(0, maxLength));
      return;
    }
    onChange(nextValue);
  }

  function updateToolbarState() {
    const editor = editorRef.current;
    if (!editor || typeof document === "undefined") return;

    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const selectedNode = range?.commonAncestorContainer;
    const selectedElement = selectedNode?.nodeType === Node.TEXT_NODE
      ? selectedNode.parentElement
      : selectedNode;

    let align: TextAlign = "left";
    if (selectedElement instanceof HTMLElement && editor.contains(selectedElement)) {
      const alignedParent = selectedElement.closest<HTMLElement>("p,h1,h2,h3,li,ul,ol,div");
      align = normalizeTextAlign(alignedParent?.style.textAlign || document.queryCommandValue("justifyCenter"));
      if (document.queryCommandState("justifyCenter")) align = "center";
      if (document.queryCommandState("justifyRight")) align = "right";
    }

    setToolbarState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strike: document.queryCommandState("strikeThrough"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
      format: formatFromQueryValue(String(document.queryCommandValue("formatBlock") || "")),
      align,
    });
  }

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
    window.requestAnimationFrame(updateToolbarState);
  }

  function formatNormal() {
    runCommand("formatBlock", "P");
  }

  function formatHeading(level: 1 | 2 | 3) {
    runCommand("formatBlock", `H${level}`);
  }

  function alignText(align: TextAlign) {
    const command = align === "center" ? "justifyCenter" : align === "right" ? "justifyRight" : "justifyLeft";
    runCommand(command);
  }

  function insertHtml(html: string) {
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    emitChange();
  }

  function insertLink() {
    const href = normalizeUrl(window.prompt("URL del enlace", "https://") ?? "");
    if (!href) return;
    const selection = window.getSelection()?.toString();
    if (!selection) insertHtml(`<a href="${escapeAttribute(href)}">${escapeHtml(href)}</a>`);
    else runCommand("createLink", href);
  }

  function openImageModal(mode: ImageSourceMode = "library") {
    rememberSelection();
    setImageMode(mode);
    setImageError("");
    setIsImageModalOpen(true);
  }

  function closeImageModal() {
    setIsImageModalOpen(false);
    setImageMode("library");
    setImageUrl("");
    setImageAlt("");
    setImageError("");
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function insertImageFromSource(srcValue: string, altValue = "") {
    const src = normalizeUrl(srcValue);
    if (!src) return;
    const alt = altValue.trim();
    insertHtml(`<figure class="rich-text-image" contenteditable="false"><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"></figure><p><br></p>`);
    setIsLibraryOpen(false);
    closeImageModal();
  }

  function insertImageUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const src = normalizeUrl(imageUrl);
    if (!src) {
      setImageError("Agrega una URL válida para la imagen.");
      return;
    }
    insertImageFromSource(src, imageAlt);
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "general");
    formData.append("alt_text", imageAlt);
    formData.append("title", file.name);

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "No se pudo subir la imagen.");
      }

      const fileUrl = data.asset?.file_url;
      if (!fileUrl) throw new Error("La subida no devolvió una URL de imagen.");

      insertImageFromSource(fileUrl, imageAlt || data.asset?.alt_text || file.name);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function insertIframe() {
    const src = normalizeUrl(window.prompt("URL del iframe", "https://www.youtube.com/embed/") ?? "");
    if (!src) return;
    insertHtml(`<div class="rich-text-embed" contenteditable="false"><iframe src="${escapeAttribute(src)}" title="Contenido embebido" loading="lazy" allowfullscreen></iframe></div><p><br></p>`);
  }

  function hasControl(control: RichTextControl) {
    return controls.includes(control);
  }

  const toolbarGroups = [
    [
      hasControl("normal") ? <ToolButton key="normal" label="Texto normal" active={toolbarState.format === "normal" && !toolbarState.ul && !toolbarState.ol} onClick={formatNormal}><TextIcon>T</TextIcon></ToolButton> : null,
      hasControl("h1") ? <ToolButton key="h1" label="Título H1" active={toolbarState.format === "h1"} onClick={() => formatHeading(1)}><TextIcon>H1</TextIcon></ToolButton> : null,
      hasControl("h2") ? <ToolButton key="h2" label="Título H2" active={toolbarState.format === "h2"} onClick={() => formatHeading(2)}><TextIcon>H2</TextIcon></ToolButton> : null,
      hasControl("h3") ? <ToolButton key="h3" label="Título H3" active={toolbarState.format === "h3"} onClick={() => formatHeading(3)}><TextIcon>H3</TextIcon></ToolButton> : null,
    ],
    [
      hasControl("bold") ? <ToolButton key="bold" label="Negrita" active={toolbarState.bold} onClick={() => runCommand("bold")}><TextIcon>B</TextIcon></ToolButton> : null,
      hasControl("italic") ? <ToolButton key="italic" label="Cursiva" active={toolbarState.italic} onClick={() => runCommand("italic")}><TextIcon italic>I</TextIcon></ToolButton> : null,
      hasControl("underline") ? <ToolButton key="underline" label="Subrayado" active={toolbarState.underline} onClick={() => runCommand("underline")}><TextIcon>U</TextIcon></ToolButton> : null,
      hasControl("strike") ? <ToolButton key="strike" label="Tachado" active={toolbarState.strike} onClick={() => runCommand("strikeThrough")}><TextIcon strike>S</TextIcon></ToolButton> : null,
    ],
    [
      hasControl("ul") ? <ToolButton key="ul" label="Lista desordenada" active={toolbarState.ul} onClick={() => runCommand("insertUnorderedList")}><ToolbarIcon name="list" /></ToolButton> : null,
      hasControl("ol") ? <ToolButton key="ol" label="Lista ordenada" active={toolbarState.ol} onClick={() => runCommand("insertOrderedList")}><ToolbarIcon name="ordered-list" /></ToolButton> : null,
    ],
    [
      hasControl("alignLeft") ? <ToolButton key="align-left" label="Alinear a la izquierda" active={toolbarState.align === "left"} onClick={() => alignText("left")}><ToolbarIcon name="align-left" /></ToolButton> : null,
      hasControl("alignCenter") ? <ToolButton key="align-center" label="Alinear al centro" active={toolbarState.align === "center"} onClick={() => alignText("center")}><ToolbarIcon name="align-center" /></ToolButton> : null,
      hasControl("alignRight") ? <ToolButton key="align-right" label="Alinear a la derecha" active={toolbarState.align === "right"} onClick={() => alignText("right")}><ToolbarIcon name="align-right" /></ToolButton> : null,
    ],
    [
      hasControl("link") ? <ToolButton key="link" label="Enlace" onClick={insertLink}><ToolbarIcon name="link" /></ToolButton> : null,
      hasControl("image") ? <ToolButton key="image" label="Imagen" onClick={() => openImageModal()}><ToolbarIcon name="image" /></ToolButton> : null,
      hasControl("iframe") ? <ToolButton key="iframe" label="Iframe" onClick={insertIframe}><ToolbarIcon name="code" /></ToolButton> : null,
    ],
  ].map((group) => group.filter(Boolean)).filter((group) => group.length);

  return (
    <div className="rich-text-field space-y-2">
      <label className="rich-text-field__label text-label-md font-bold uppercase tracking-wide text-on-surface-variant">{label}</label>
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
      <div className="rich-text-field__box overflow-hidden rounded-xl border border-outline-variant">
        <div className="rich-text-field__toolbar flex flex-wrap gap-1 border-b border-outline-variant bg-surface-container-low px-3 py-2" role="toolbar" aria-label={`Herramientas de ${label}`}>
          {toolbarGroups.map((group, groupIndex) => (
            <div className="rich-text-field__tool-group" role="group" key={`toolbar-group-${groupIndex}`}>
              {group}
            </div>
          ))}
        </div>
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-label={label}
          aria-multiline="true"
          data-placeholder={placeholder}
          onFocus={() => {
            setIsFocused(true);
            window.requestAnimationFrame(updateToolbarState);
          }}
          onBlur={() => {
            setIsFocused(false);
            emitChange();
          }}
          onInput={emitChange}
          onKeyUp={updateToolbarState}
          onMouseUp={updateToolbarState}
          onPaste={() => window.requestAnimationFrame(() => {
            emitChange();
            updateToolbarState();
          })}
          className={`rich-text-field__editor block w-full bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none ${className ?? ""}`}
          style={{ minHeight }}
          suppressContentEditableWarning
          {...props}
        />
      </div>
      {maxLength ? <p className="rich-text-field__counter">{value.length}/{maxLength}</p> : null}
      {isImageModalOpen ? (
        <div className="rich-text-image-modal" role="dialog" aria-modal="true" aria-labelledby="rich-text-image-modal-title">
          <button type="button" className="rich-text-image-modal__backdrop" aria-label="Cerrar imagen" onClick={closeImageModal} />
          <div className="rich-text-image-modal__panel">
            <div className="rich-text-image-modal__header">
              <div>
                <h3 id="rich-text-image-modal-title" className="rich-text-image-modal__title">Insertar imagen</h3>
                <p className="rich-text-image-modal__copy">Elige una fuente y la imagen se insertará como Markdown en el contenido.</p>
              </div>
              <button type="button" className="rich-text-image-modal__close" onClick={closeImageModal} aria-label="Cerrar">x</button>
            </div>

            <div className="rich-text-image-modal__tabs" role="tablist" aria-label="Fuente de imagen">
              <button type="button" className={imageMode === "library" ? "is-active" : ""} onClick={() => setImageMode("library")}>Biblioteca</button>
              <button type="button" className={imageMode === "upload" ? "is-active" : ""} onClick={() => setImageMode("upload")}>Subir imagen</button>
              <button type="button" className={imageMode === "url" ? "is-active" : ""} onClick={() => setImageMode("url")}>URL externa</button>
            </div>

            <label className="rich-text-image-modal__field">
              <span>Texto alternativo</span>
              <input type="text" value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Describe la imagen" />
            </label>

            {imageMode === "library" ? (
              <div className="rich-text-image-modal__option">
                <p>Usa una imagen activa de la biblioteca del proyecto.</p>
                <button type="button" className="primary-btn" onClick={() => setIsLibraryOpen(true)}>Abrir biblioteca</button>
              </div>
            ) : null}

            {imageMode === "upload" ? (
              <div className="rich-text-image-modal__option">
                <p>Sube una imagen a Supabase Storage y agrégala al editor al terminar.</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadImage} disabled={isUploading} />
                {isUploading ? <span className="rich-text-image-modal__status">Subiendo imagen...</span> : null}
              </div>
            ) : null}

            {imageMode === "url" ? (
              <form className="rich-text-image-modal__option" onSubmit={insertImageUrl}>
                <label className="rich-text-image-modal__field">
                  <span>URL de la imagen</span>
                  <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." />
                </label>
                <button type="submit" className="primary-btn">Insertar imagen</button>
              </form>
            ) : null}

            {imageError ? <p className="rich-text-image-modal__error" role="alert">{imageError}</p> : null}
          </div>
        </div>
      ) : null}
      <MediaLibraryModal
        open={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(url) => insertImageFromSource(url, imageAlt)}
      />
    </div>
  );
}
