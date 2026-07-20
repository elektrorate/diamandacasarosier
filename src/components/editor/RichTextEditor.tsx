"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import EditorMediaDialog from "./EditorMediaDialog";
import EditorToolbar, { defaultRichTextEditorControls } from "./EditorToolbar";
import TypographyPanel from "./TypographyPanel";
import { editorExtensions } from "./editor-extensions";
import { htmlRootToMarkdown, markdownToHtml } from "./markdown-codec";
import type { RichTextEditorProps, TypographyState } from "./editor-types";

export default function RichTextEditor({
  label,
  value,
  onChange,
  minHeight = "190px",
  className,
  controls = defaultRichTextEditorControls,
  name,
  required,
  maxLength,
  placeholder,
  ...props
}: RichTextEditorProps) {
  const [mediaKind, setMediaKind] = useState<"image" | "iframe" | null>(null);
  const [typography, setTypography] = useState<TypographyState>({ italic: false, weight: 400, width: 100, fontSize: 28 });
  const lastMarkdownRef = useRef(value);
  const editorShellRef = useRef<HTMLDivElement | null>(null);
  const descriptionId = `${label.replace(/\s+/g, "-").toLowerCase()}-editor-description`;

  const extensions = useMemo(() => editorExtensions(placeholder), [placeholder]);
  const editor = useEditor({
    extensions,
    content: markdownToHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor__content",
        style: `min-height: ${minHeight}`,
        "aria-label": label,
        ...(maxLength ? { "aria-describedby": descriptionId } : {}),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const root = currentEditor.view.dom as HTMLElement;
      const nextMarkdown = htmlRootToMarkdown(root);
      lastMarkdownRef.current = nextMarkdown;
      onChange(nextMarkdown);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastMarkdownRef.current) return;
    lastMarkdownRef.current = value;
    editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
  }, [editor, value]);

  const plainTextLength = editor?.state.doc.textContent.length ?? 0;
  const overLimit = typeof maxLength === "number" && plainTextLength > maxLength;
  const previewStyle = {
    "--tiptap-preview-font-size": `${typography.fontSize}px`,
    "--tiptap-preview-font-weight": typography.weight,
    "--tiptap-preview-font-stretch": `${typography.width}%`,
    "--tiptap-preview-font-width": typography.width,
    "--tiptap-preview-font-style": typography.italic ? "italic" : "normal",
  } as CSSProperties;

  return (
    <div {...props} className={`tiptap-editor ${className ?? ""}`} ref={editorShellRef}>
      <div className="tiptap-editor__label-row">
        <label className="tiptap-editor__label">{label}{required ? " *" : ""}</label>
        {typeof maxLength === "number" ? (
          <span className={overLimit ? "tiptap-editor__count is-over" : "tiptap-editor__count"} id={descriptionId}>
            {plainTextLength}/{maxLength}
          </span>
        ) : null}
      </div>
      {editor ? (
        <>
          <div className="tiptap-editor__workspace" style={previewStyle}>
            <TypographyPanel typography={typography} onChange={setTypography} />
            <div className="tiptap-editor__main">
              <EditorToolbar
                editor={editor}
                controls={controls}
                typography={typography}
                onTypographyChange={setTypography}
                onOpenImage={() => setMediaKind("image")}
                onOpenIframe={() => setMediaKind("iframe")}
              />
              <div className={overLimit ? "tiptap-editor__surface is-over" : "tiptap-editor__surface"}>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="tiptap-editor__loading" style={{ minHeight }}>Cargando editor...</div>
      )}
      {name ? <textarea name={name} value={value} required={required} readOnly hidden /> : null}
      <EditorMediaDialog
        open={Boolean(mediaKind)}
        kind={mediaKind ?? "image"}
        onClose={() => setMediaKind(null)}
        onInsertImage={(src, alt) => editor?.chain().focus().setImage({ src, alt }).run()}
        onInsertIframe={(src) => editor?.chain().focus().setIframe({ src }).run()}
      />
    </div>
  );
}
