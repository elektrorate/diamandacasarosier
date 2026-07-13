"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Coupon } from "@/lib/cms/types";

export default function CouponForm({ mode, item }: { mode: "create" | "edit"; item?: Coupon }) {
  const router = useRouter();
  const [code, setCode] = useState(item?.code ?? "");
  const [status, setStatus] = useState(item?.status ?? "active");
  const [discountType, setDiscountType] = useState(item?.discount_type ?? "percentage");
  const [value, setValue] = useState<number | null>(item?.value ?? null);
  const [startDate, setStartDate] = useState(item?.start_date ?? "");
  const [endDate, setEndDate] = useState(item?.end_date ?? "");
  const [usageLimit, setUsageLimit] = useState<number | null>(item?.usage_limit ?? null);
  const [minAmount, setMinAmount] = useState<number | null>(item?.minimum_order_amount ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setIsLoading(true); setError(null);
    if (!code.trim()) { setError("El código es obligatorio."); setIsLoading(false); return; }
    const res = await fetch(mode === "create" ? "/api/admin/shop/coupons" : `/api/admin/shop/coupons/${item?.id}`, {
      method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, status, discount_type: discountType, value, start_date: startDate, end_date: endDate, usage_limit: usageLimit, minimum_order_amount: minAmount }),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({ error: "Error" })); setError((d as { error?: string }).error || "Error"); setIsLoading(false); return; }
    router.push("/admin/shop/coupons"); router.refresh();
  }

  return (<form className="editor-form" onSubmit={handleSubmit}><section className="form-block"><h3>{mode === "create" ? "Nuevo cupón" : "Editar cupón"}</h3>
    <div className="grid-2">
      <label className="field"><span>Código</span><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={{ fontFamily: "monospace" }} /></label>
      <label className="field"><span>Estado</span><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="expired">Expirado</option></select></label>
      <label className="field"><span>Tipo de descuento</span><select value={discountType} onChange={(e) => setDiscountType(e.target.value as typeof discountType)}><option value="percentage">Porcentaje (%)</option><option value="fixed">Fijo (€)</option></select></label>
      <label className="field"><span>Valor</span><input type="number" step="0.01" value={value ?? ""} onChange={(e) => setValue(e.target.value ? Number(e.target.value) : null)} /></label>
      <label className="field"><span>Fecha inicio</span><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
      <label className="field"><span>Fecha fin</span><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
      <label className="field"><span>Límite de usos</span><input type="number" value={usageLimit ?? ""} onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : null)} /></label>
      <label className="field"><span>Mínimo de pedido</span><input type="number" step="0.01" value={minAmount ?? ""} onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : null)} /></label>
    </div>
  </section>{error ? <p className="form-error">{error}</p> : null}<div className="form-actions"><button className="primary-btn" type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : mode === "create" ? "Crear cupón" : "Guardar cambios"}</button></div></form>);
}
