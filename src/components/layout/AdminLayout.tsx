import type { ReactNode } from "react";
import { requireAdminProfile, type AdminProfile } from "@/lib/auth/supabase-auth";
import { PROJECT_VERSION } from "@/lib/project-version";
import Sidebar from "./Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
  session?: { user: { id: string; email?: string | null }; profile: AdminProfile } | null;
}

export default async function AdminLayout({ children, session: initialSession }: AdminLayoutProps) {
  const session = initialSession ?? await requireAdminProfile();
  const email = session?.profile.email || session?.user.email || "";
  const name = session?.profile.full_name?.trim() || email.split("@")[0] || "Admin";

  return (
    <div className="cms-admin cms-admin-shell">
      <Sidebar userName={name} userEmail={email} appVersion={PROJECT_VERSION} />
      <main className="cms-admin-main">
        <div className="cms-admin-content">{children}</div>
      </main>
    </div>
  );
}
