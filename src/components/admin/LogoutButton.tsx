"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/auth");
    router.refresh();
  }

  return (
    <button className="secondary-btn" type="button" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}
