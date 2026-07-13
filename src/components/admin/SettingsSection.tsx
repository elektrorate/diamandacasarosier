import type { ReactNode } from "react";

export default function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="settings-section">
      <div className="settings-section-head">
        <h3>{title}</h3>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      <div className="settings-section-body">{children}</div>
    </div>
  );
}
