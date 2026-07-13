import type { ButtonHTMLAttributes } from "react";

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "role"> {
  checked: boolean;
  label: string;
  description?: string;
  onCheckedChange: (checked: boolean) => void;
}

export default function Switch({
  checked,
  label,
  description,
  onCheckedChange,
  className = "",
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary-container disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span>
        <span className="block text-body-md font-semibold text-on-surface">{label}</span>
        {description ? <span className="mt-1 block text-label-md text-on-surface-variant/70">{description}</span> : null}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-secondary" : "bg-outline-variant"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
