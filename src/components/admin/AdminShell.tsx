import type { ReactNode } from "react";

interface AdminShellProps {
  children: ReactNode;
  topBar?: ReactNode;
}

export default function AdminShell({ children, topBar }: AdminShellProps) {
  return <>{topBar}{children}</>;
}
