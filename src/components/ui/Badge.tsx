interface BadgeProps {
  variant?: "success" | "info" | "warning" | "error" | "neutral";
  children: string;
  className?: string;
}

const styles = {
  success: "bg-green-100 text-green-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-orange-100 text-orange-700",
  error: "bg-red-100 text-red-700",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export default function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] leading-none ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
