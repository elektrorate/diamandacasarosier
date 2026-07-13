import type { ReactNode } from "react";

interface MetricCardProps {
  icon: string;
  iconBg: string;
  iconClassName?: string;
  value: string | number;
  label: string;
  trend?: { value: string; positive: boolean };
  footer?: ReactNode;
  badge?: string | number;
  badgeClass?: string;
}

export default function MetricCard({
  icon,
  iconBg,
  iconClassName = "text-on-primary-container",
  value,
  label,
  trend,
  footer,
  badge,
  badgeClass = "",
}: MetricCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl transition-all hover:shadow-lg group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${iconClassName}`}>{icon}</span>
        </div>
        {trend && (
          <span className={`font-bold text-sm ${trend.positive ? "text-green-500" : "text-error"}`}>
            {trend.value}
          </span>
        )}
        {badge !== undefined && (
          <span className={`bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-headline-lg text-headline-lg text-on-surface">{value}</div>
      <div className="text-on-surface-variant font-medium">{label}</div>
      {footer && (
        <div className="mt-4 flex items-center text-label-md text-on-surface-variant opacity-70">
          {footer}
        </div>
      )}
    </div>
  );
}
