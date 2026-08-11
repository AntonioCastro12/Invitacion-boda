import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import GuestForm from "../admin/GuestForm";
import GuestTable from "../admin/GuestTable";
import { useEvent } from "../hooks/useEvent";
import { createGuest, deleteGuest, listGuests, updateGuest } from "../services/guestService";

export default function GuestsPage() {
  const { event, loading: eventLoading } = useEvent();
  const [guests, setGuests] = useState([]); const [query, setQuery] = useState(""); const [editing, setEditing] = useState(undefined); const [formOpen, setFormOpen] = useState(false); const [saving, setSaving] = useState(false); const [notice, setNotice] = useState("");
  const load = useCallback(async () => { if (event) setGuests(await listGuests(event.id)); }, [event]);
  useEffect(() => { load().catch((e) => setNotice(e.message)); }, [load]);
  const filtered = useMemo(() => guests.filter((g) => `${g.name} ${g.phone} ${g.code}`.toLowerCase().includes(query.toLowerCase())), [guests, query]);
  function showNotice(message) { setNotice(message); window.setTimeout(() => setNotice(""), 2800); }
  async function save(values) { setSaving(true); try { if (editing) await updateGuest(editing.id, values); else await createGuest(event.id, values); await load(); setFormOpen(false); setEditing(undefined); showNotice(editing ? "Invitado actualizado correctamente." : "Invitación creada correctamente."); } catch (e) { showNotice(e.message); } finally { setSaving(false); } }
  async function remove(guest) { if (!window.confirm(`¿Eliminar la invitación de ${guest.name}?`)) return; try { await deleteGuest(guest.id); await load(); showNotice("Invitado eliminado."); } catch (e) { showNotice(e.message); } }
  async function copy(url) { await navigator.clipboard.writeText(url); showNotice("Enlace copiado correctamente."); }
  if (eventLoading || !event) return <div className="panel-loading">Cargando invitados…</div>;
  return <section><header className="page-header"><div><span className="page-eyebrow">Gestión</span><h1>Invitados</h1><p>Administra familias, pases y enlaces personalizados.</p></div><button className="button button--gold" type="button" onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus size={18} /> Agregar invitado</button></header>{notice && <div className="toast" role="status">{notice}</div>}<div className="toolbar"><label className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, teléfono o código…" /></label><span>{filtered.length} de {guests.length} invitados</span></div><GuestTable event={event} guests={filtered} onEdit={(guest) => { setEditing(guest); setFormOpen(true); }} onDelete={remove} onCopy={copy} />{formOpen && <GuestForm guest={editing} onSave={save} onClose={() => setFormOpen(false)} saving={saving} />}</section>;
}
