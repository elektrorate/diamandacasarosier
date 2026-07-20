"use client";

import type { Editor } from "@tiptap/react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { RichTextEditorControl, TypographyState } from "./editor-types";

function TextIcon({ children, italic, strike }: { children: string; italic?: boolean; strike?: boolean }) {
  return <span className={`tiptap-editor__text-icon${italic ? " is-italic" : ""}${strike ? " is-strike" : ""}`}>{children}</span>;
}

function SvgIcon({ name }: { name: "undo" | "redo" | "list" | "ordered" | "quote" | "left" | "center" | "right" | "justify" | "link" | "image" | "iframe" }) {
  const props = { className: "tiptap-editor__svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "undo") return <svg {...props}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-1" /></svg>;
  if (name === "redo") return <svg {...props}><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h1" /></svg>;
  if (name === "list") return <svg {...props}><path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" /><path d="M4 6h.01" /><path d="M4 12h.01" /><path d="M4 18h.01" /></svg>;
  if (name === "ordered") return <svg {...props}><path d="M10 6h10" /><path d="M10 12h10" /><path d="M10 18h10" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M4 14h2l-2 4h2" /></svg>;
  if (name === "quote") return <svg {...props}><path d="M7 17h3V7H5v5h2z" /><path d="M17 17h3V7h-5v5h2z" /></svg>;
  if (name === "left") return <svg {...props}><path d="M4 6h16" /><path d="M4 12h10" /><path d="M4 18h14" /></svg>;
  if (name === "center") return <svg {...props}><path d="M4 6h16" /><path d="M7 12h10" /><path d="M5 18h14" /></svg>;
  if (name === "right") return <svg {...props}><path d="M4 6h16" /><path d="M10 12h10" /><path d="M6 18h14" /></svg>;
  if (name === "justify") return <svg {...props}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>;
  if (name === "link") return <svg {...props}><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" /><path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07" /></svg>;
  if (name === "image") return <svg {...props}><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m20 15-4.5-4.5L7 19" /></svg>;
  return <svg {...props}><path d="m8 9-4 3 4 3" /><path d="m16 9 4 3-4 3" /></svg>;
}

function ToolButton({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`tiptap-editor__tool${active ? " is-active" : ""}`}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export const defaultRichTextEditorControls: RichTextEditorControl[] = [
  "undo", "redo", "normal", "h1", "h2", "h3", "bold", "italic", "underline", "strike", "blockquote", "ul", "ol", "alignLeft", "alignCenter", "alignRight", "alignJustify", "link", "image", "iframe",
];

export default function EditorToolbar({
  editor,
  controls,
  typography,
  onTypographyChange,
  onOpenImage,
  onOpenIframe,
}: {
  editor: Editor;
  controls: RichTextEditorControl[];
  typography: TypographyState;
  onTypographyChange: Dispatch<SetStateAction<TypographyState>>;
  onOpenImage: () => void;
  onOpenIframe: () => void;
}) {
  const has = (control: RichTextEditorControl) => controls.includes(control);
  const blockValue = editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "paragraph";
  const setBlock = (value: string) => {
    if (value === "h1") editor.chain().focus().setHeading({ level: 1 }).run();
    else if (value === "h2") editor.chain().focus().setHeading({ level: 2 }).run();
    else if (value === "h3") editor.chain().focus().setHeading({ level: 3 }).run();
    else editor.chain().focus().setParagraph().run();
  };

  return (
    <div className="tiptap-editor__toolbar" role="toolbar" aria-label="Herramientas de texto">
      <select className="tiptap-editor__style-select" aria-label="Estilo de texto" value={blockValue} onChange={(event) => setBlock(event.target.value)}>
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>
      <span className="tiptap-editor__divider" aria-hidden="true" />
      <button type="button" className="tiptap-editor__size-button" aria-label="Reducir tamano" onClick={() => onTypographyChange((current) => ({ ...current, fontSize: Math.max(10, current.fontSize - 1) }))}>-</button>
      <span className="tiptap-editor__font-size">{typography.fontSize}px</span>
      <button type="button" className="tiptap-editor__size-button" aria-label="Aumentar tamano" onClick={() => onTypographyChange((current) => ({ ...current, fontSize: Math.min(96, current.fontSize + 1) }))}>+</button>
      <span className="tiptap-editor__divider" aria-hidden="true" />
      {has("undo") ? <ToolButton label="Deshacer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><SvgIcon name="undo" /></ToolButton> : null}
      {has("redo") ? <ToolButton label="Rehacer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><SvgIcon name="redo" /></ToolButton> : null}
      {has("bold") ? <ToolButton label="Negrita" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><TextIcon>B</TextIcon></ToolButton> : null}
      {has("italic") ? <ToolButton label="Cursiva" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><TextIcon italic>I</TextIcon></ToolButton> : null}
      {has("underline") ? <ToolButton label="Subrayado" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><TextIcon>U</TextIcon></ToolButton> : null}
      {has("strike") ? <ToolButton label="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><TextIcon strike>S</TextIcon></ToolButton> : null}
      {has("blockquote") ? <ToolButton label="Cita" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><SvgIcon name="quote" /></ToolButton> : null}
      {has("ul") ? <ToolButton label="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><SvgIcon name="list" /></ToolButton> : null}
      {has("ol") ? <ToolButton label="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><SvgIcon name="ordered" /></ToolButton> : null}
      {has("alignLeft") ? <ToolButton label="Alinear izquierda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><SvgIcon name="left" /></ToolButton> : null}
      {has("alignCenter") ? <ToolButton label="Centrar" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><SvgIcon name="center" /></ToolButton> : null}
      {has("alignRight") ? <ToolButton label="Alinear derecha" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><SvgIcon name="right" /></ToolButton> : null}
      {has("alignJustify") ? <ToolButton label="Justificar" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><SvgIcon name="justify" /></ToolButton> : null}
      {has("link") ? <ToolButton label="Enlace" active={editor.isActive("link")} onClick={() => {
        const previous = editor.getAttributes("link").href as string | undefined;
        const href = window.prompt("URL del enlace", previous || "https://");
        if (href === null) return;
        if (!href.trim()) editor.chain().focus().unsetLink().run();
        else editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
      }}><SvgIcon name="link" /></ToolButton> : null}
      {has("image") ? <ToolButton label="Imagen" onClick={onOpenImage}><SvgIcon name="image" /></ToolButton> : null}
      {has("iframe") ? <ToolButton label="Iframe" onClick={onOpenIframe}><SvgIcon name="iframe" /></ToolButton> : null}
    </div>
  );
}
