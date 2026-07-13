"use client";

import { useState } from "react";
import { MarkdownContent, renderInlineMarkdown } from "@/components/ui/MarkdownContent";
import type { ProgramItem } from "@/data/types";

export function Accordion({ items }: { items: ProgramItem[] }) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set([0]));

  const toggle = (index: number) => {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="course-accordion">
      {items.map((item, index) => {
        const open = openItems.has(index);
        const panelId = `course-panel-${index}`;
        return (
          <div
            className={`course-accordion__item ${open ? "is-open" : ""}`}
            key={item.title}
          >
            <button
              className="course-accordion__trigger"
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span>{item.title}</span>
              <span className="course-accordion__symbol" aria-hidden="true">
                {open ? "-" : "+"}
              </span>
            </button>
            <div
              className="course-accordion__panel"
              id={panelId}
              hidden={!open}
            >
              <div className="course-accordion__content">
                <MarkdownContent source={item.content} />
                {item.points?.length ? (
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{renderInlineMarkdown(point)}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
