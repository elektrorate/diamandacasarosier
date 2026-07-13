import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export default function Input({ label, error, helpText, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const base =
    "block w-full rounded-lg border bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container transition-colors";
  const borderClass = error
    ? "border-error focus:border-error"
    : "border-outline-variant focus:border-primary-container";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-label-md text-on-surface-variant font-medium">
          {label}
        </label>
      )}
      <input id={inputId} className={`${base} ${borderClass} ${className}`} {...props} />
      {helpText && !error && <p className="text-label-md text-on-surface-variant/60">{helpText}</p>}
      {error && <p className="text-label-md text-error">{error}</p>}
    </div>
  );
}
