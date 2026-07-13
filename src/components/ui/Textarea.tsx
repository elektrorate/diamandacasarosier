import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = "", id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const base =
    "block w-full rounded-lg border bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container transition-colors resize-vertical min-h-[100px]";
  const borderClass = error
    ? "border-error focus:border-error"
    : "border-outline-variant focus:border-primary-container";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-label-md text-on-surface-variant font-medium">
          {label}
        </label>
      )}
      <textarea id={textareaId} className={`${base} ${borderClass} ${className}`} {...props} />
      {error && <p className="text-label-md text-error">{error}</p>}
    </div>
  );
}
