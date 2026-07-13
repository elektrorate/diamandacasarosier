import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({ label, error, options, placeholder, className = "", id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const base =
    "block w-full rounded-lg border bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-colors appearance-none";
  const borderClass = error
    ? "border-error focus:border-error"
    : "border-outline-variant focus:border-primary-container";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-label-md text-on-surface-variant font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select id={selectId} className={`${base} ui-select ${borderClass} ${className}`} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-label-md text-error">{error}</p>}
    </div>
  );
}
