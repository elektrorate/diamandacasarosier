"use client";

import type { ButtonHTMLAttributes } from "react";

interface MarketingSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "role"> {
  checked: boolean;
  label: string;
  description?: string;
  icon?: string;
  compact?: boolean;
  statusText?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function MarketingSwitch({
  checked,
  label,
  description,
  icon,
  compact = false,
  statusText = true,
  onCheckedChange,
  className = "",
  disabled,
  ...props
}: MarketingSwitchProps) {
  const track = (
    <span
      className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors duration-200 ${
        checked
          ? "border-secondary bg-secondary"
          : "border-outline-variant bg-surface-container-high"
      }`}
      aria-hidden="true"
    >
      <span
        className={`absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </span>
  );

  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`group inline-flex min-h-11 w-full items-center justify-between gap-4 rounded-xl border border-outline-variant bg-white text-left transition-colors duration-150 hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-container disabled:cursor-not-allowed disabled:opacity-50 ${
        compact ? "px-3 py-2" : "p-4"
      } ${className}`}
    >
      <span className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-container-low text-secondary" aria-hidden="true">
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </span>
        ) : null}
        <span className="min-w-0">
          <span className="block text-body-md font-semibold text-on-surface">{label}</span>
          {description ? <span className="mt-1 block text-label-md text-on-surface-variant">{description}</span> : null}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {statusText ? (
          <span className={`hidden text-label-sm font-semibold sm:inline ${checked ? "text-secondary" : "text-on-surface-variant"}`}>
            {checked ? "Activo" : "Inactivo"}
          </span>
        ) : null}
        {track}
      </span>
    </button>
  );
}
