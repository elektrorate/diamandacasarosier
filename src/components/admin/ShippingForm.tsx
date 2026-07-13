"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ShippingMethod } from "@/lib/cms/types";

export default function ShippingForm({ items }: { items: ShippingMethod[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("standard");
  const [price, setPrice] = useState<number | null>(null);
  const [countries, setCountries] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function toggleStatus(id: string, current: string) {
    await fetch(`/api/admin/shop/shipping`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: current === "active" ? "inactive" : "active" }) });
    router.refresh();
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/admin/shop/shipping`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, name, type, price, countries: countries.split("\n").map((s) => s.trim()).filter(Boolean), description }) });
    } else {
      await fetch(`/api/admin/shop/shipping`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, type, price, countries: countries.split("\n").map((s) => s.trim()).filter(Boolean), description }) });
    }
    setShowForm(false); setEditingId(null); setName(""); setType("standard"); setPrice(null); setCountries(""); setDescription("");
    router.refresh();
  }
  function edit(m: ShippingMethod) { setEditingId(m.id); setName(m.name); setType(m.type); setPrice(m.price); setCountries(m.countries.join("\n")); setDescription(m.description); setShowForm(true); }

  async function moveDir(id: string, dir: "up" | "down") {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === id);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === sorted.length - 1)) return;
    const swapped = [...sorted]; [swapped[idx], swapped[dir === "up" ? idx - 1 : idx + 1]] = [swapped[dir === "up" ? idx - 1 : idx + 1], swapped[idx]];
    await fetch(`/api/admin/shop/shipping`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reorder", orderedIds: swapped.map((s) => s.id) }) });
    router.refresh();
  }

  return (<div><div className="page-header" style={{ marginBottom: "1rem" }}><h3>Métodos de envío</h3><button className="primary-btn" onClick={() => { setShowForm(!showForm); setEditingId(null); setName(""); setType("standard"); setPrice(null); setCountries(""); setDescription(""); }}>{showForm ? "Cancelar" : "Nuevo método"}</button></div>
    {showForm ? <form className="editor-form" onSubmit={save} style={{ marginBottom: "1.5rem" }}><div className="grid-2"><label className="field"><span>Nombre</span><input value={name} onChange={(e) => setName(e.target.value)} required /></label><label className="field"><span>Tipo</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="standard">Estándar</option><option value="express">Express</option><option value="free">Gratuito</option><option value="pickup">Recogida</option></select></label><label className="field"><span>Precio</span><input type="number" step="0.01" value={price ?? ""} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : null)} /></label><label className="field"><span>Orden</span><input type="number" value={items.length} disabled /></label><label className="field span-2"><span>Países (uno por línea)</span><textarea rows={3} value={countries} onChange={(e) => setCountries(e.target.value)} /></label><label className="field span-2"><span>Descripción</span><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></label></div><div className="form-actions"><button className="primary-btn" type="submit">{editingId ? "Guardar cambios" : "Crear método"}</button></div></form> : null}
    <div className="table-card"><table className="admin-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Estado</th><th>Orden</th><th>Acciones</th></tr></thead><tbody>{[...items].sort((a, b) => a.sort_order - b.sort_order).map((m, i, arr) => (<tr key={m.id}><td><strong>{m.name}</strong></td><td>{m.type}</td><td style={{ fontWeight: 600 }}>{m.price !== null ? `${m.price} €` : "Gratuito"}</td><td>{m.status}</td><td><div className="row-actions"><button className="secondary-btn" onClick={() => moveDir(m.id, "up")} disabled={i === 0}>▲</button><button className="secondary-btn" onClick={() => moveDir(m.id, "down")} disabled={i === arr.length - 1}>▼</button></div></td><td><div className="row-actions"><button className="secondary-btn" onClick={() => edit(m)}>Editar</button><button className="secondary-btn" onClick={() => toggleStatus(m.id, m.status)}>{m.status === "active" ? "Desactivar" : "Activar"}</button></div></td></tr>))}</tbody></table></div></div>);
}
