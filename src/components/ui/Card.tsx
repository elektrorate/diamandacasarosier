import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl ${
        hover ? "transition-all hover:shadow-lg" : ""
      } ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
