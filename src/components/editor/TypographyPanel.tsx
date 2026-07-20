"use client";

import type { Dispatch, SetStateAction } from "react";
import type { TypographyState } from "./editor-types";

function AxisInfo({ title }: { title: string }) {
  return <span className="tiptap-typography-panel__info" title={title} aria-hidden="true">i</span>;
}

export default function TypographyPanel({ typography, onChange }: { typography: TypographyState; onChange: Dispatch<SetStateAction<TypographyState>> }) {
  return (
    <aside className="tiptap-typography-panel" aria-label="Variable axes">
      <div className="tiptap-typography-panel__head">
        <span>Variable Axes</span>
        <button type="button" aria-label="Restablecer ejes" onClick={() => onChange({ italic: false, weight: 400, width: 100, fontSize: 28 })}>reset</button>
      </div>

      <label className="tiptap-typography-panel__toggle">
        <span>Italic <AxisInfo title="Activa la variante cursiva de la fuente." /></span>
        <input
          type="checkbox"
          checked={typography.italic}
          onChange={(event) => onChange((current) => ({ ...current, italic: event.target.checked }))}
        />
      </label>

      <label className="tiptap-typography-panel__axis">
        <span>Weight <AxisInfo title="wght: ajusta el peso del trazo, de mas ligero a mas grueso." /></span>
        <output>{typography.weight}</output>
        <input
          type="range"
          min={100}
          max={900}
          step={1}
          value={typography.weight}
          onChange={(event) => onChange((current) => ({ ...current, weight: Number(event.target.value) }))}
        />
      </label>

      <label className="tiptap-typography-panel__axis">
        <span>Width <AxisInfo title="wdth: ajusta las proporciones de la letra, de mas estrecha a mas ancha." /></span>
        <output>{typography.width}</output>
        <input
          type="range"
          min={75}
          max={125}
          step={1}
          value={typography.width}
          onChange={(event) => onChange((current) => ({ ...current, width: Number(event.target.value) }))}
        />
      </label>
    </aside>
  );
}
