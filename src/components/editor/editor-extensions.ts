import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { mergeAttributes, Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { normalizeEditorUrl } from "./markdown-codec";

export const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (element) => normalizeEditorUrl(element.getAttribute("src") ?? ""),
      },
      title: {
        default: "Contenido embebido",
      },
    };
  },

  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const src = normalizeEditorUrl(HTMLAttributes.src ?? "");
    return ["iframe", mergeAttributes(HTMLAttributes, { src, loading: "lazy", allowfullscreen: "true" })];
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string; title?: string }) =>
        ({ commands }) => {
          const src = normalizeEditorUrl(options.src);
          if (!src) return false;
          return commands.insertContent({ type: this.name, attrs: { src, title: options.title || "Contenido embebido" } });
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export function editorExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      protocols: ["http", "https", "mailto", "tel"],
    }),
    Image.configure({ allowBase64: false, inline: false }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }),
    Placeholder.configure({ placeholder: placeholder || "Escribe aqui..." }),
    Iframe,
  ];
}
