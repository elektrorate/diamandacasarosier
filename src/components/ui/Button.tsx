import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  children?: ReactNode;
  href?: string;
}

export default function Button({
  variant = "solid",
  size = "md",
  icon,
  children,
  className = "",
  href,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all active:scale-95 duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    solid:
      "bg-secondary text-on-secondary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary-container",
    outlined:
      "border border-secondary-container text-primary font-medium hover:bg-secondary-container/5 focus:outline-none focus:ring-2 focus:ring-primary-container",
    ghost:
      "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container",
  };

  const sizes = {
    sm: "h-9 px-4 text-label-md",
    md: "h-10 px-6 text-label-md",
    lg: "h-12 px-8 text-body-md",
  };

  const content = (
    <>
      {icon && <span className="material-symbols-outlined text-[1.2em]">{icon}</span>}
      {children}
    </>
  );

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
