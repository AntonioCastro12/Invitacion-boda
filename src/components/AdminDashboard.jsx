"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, Copy, ExternalLink, Heart, Link2, LoaderCircle, Plus, RefreshCw, ShieldCheck, TicketCheck, Trash2, UserCheck, Users } from "lucide-react";

const emptyStats = { invitations: 0, invited: 0, confirmed: 0, pending: 0, declined: 0, checkIns: 0 };

export default function AdminDashboard({ adminName, initialCheckin = "" }) {
  const [summary, setSummary] = useState({ stats: emptyStats, guests: [] });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ type: "idle", message: "" });
  const [checkin, setCheckin] = useState(initialCheckin);
  const [newGuest, setNewGuest] = useState({ name: "", passes: 2 });

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/summary", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible cargar el panel.");
      setSummary(payload);
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No fue posible cargar el panel." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const createGuest = async (event) => {
    event.preventDefault();
    setNotice({ type: "loading", message: "Creando invitación…" });
    try {
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newGuest),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible crear la invitación.");
      const invitationUrl = `${window.location.origin}/i/${payload.guest.token}`;
      await navigator.clipboard.writeText(invitationUrl);
      setNewGuest({ name: "", passes: 2 });
      setNotice({ type: "success", message: "Invitación creada y enlace copiado." });
      await loadSummary();
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No fue posible crear la invitación." });
    }
  };

  const validateCheckin = async (event) => {
    event.preventDefault();
    setNotice({ type: "loading", message: "Validando código…" });
    try {
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: checkin }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible validar el acceso.");
      setNotice({ type: "success", message: `Acceso autorizado para ${payload.guest.name} (${payload.guest.max_passes} lugares).` });
      setCheckin("");
      await loadSummary();
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No fue posible validar el acceso." });
    }
  };

  const copyUrl = async (token) => {
    await navigator.clipboard.writeText(`${window.location.origin}/i/${token}`);
    setNotice({ type: "success", message: "Enlace personalizado copiado." });
  };

  const deleteGuest = async (guest) => {
    if (!window.confirm(`¿Eliminar la invitación de ${guest.name}?`)) return;
    try {
      const response = await fetch("/api/admin/guests", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: guest.token }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible eliminar la invitación.");
      setNotice({ type: "success", message: "Invitación eliminada." });
      await loadSummary();
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "No fue posible eliminar la invitación." });
    }
  };

  const statCards = [
    ["Invitaciones", summary.stats.invitations, TicketCheck],
    ["Personas invitadas", summary.stats.invited, Users],
    ["Confirmadas", summary.stats.confirmed, UserCheck],
    ["Pendientes", summary.stats.pending, RefreshCw],
    ["No asistirán", summary.stats.declined, Heart],
    ["Accesos", summary.stats.checkIns, ShieldCheck],
  ];

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span>Invitación VIP · Dulce &amp; Eduardo</span>
          <h1>Panel de invitados</h1>
          <p>Hola, {adminName}. Aquí puedes crear pases, revisar confirmaciones y validar entradas.</p>
        </div>
        <a className="button button--outline" href="/" target="_blank" rel="noreferrer">
          Ver invitación <ExternalLink size={14} />
        </a>
      </header>

      {notice.message && <div className={`admin-notice admin-notice--${notice.type}`} role="status">{notice.message}</div>}

      <section className="admin-stats" aria-label="Resumen del evento">
        {statCards.map(([label, value, Icon]) => (
          <article key={label}>
            <Icon size={20} strokeWidth={1.4} />
            <strong>{loading ? "—" : value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="admin-actions">
        <form className="admin-card" onSubmit={createGuest}>
          <div className="admin-card__heading">
            <Plus size={20} />
            <div><h2>Nueva invitación</h2><p>Genera un enlace y un QR únicos.</p></div>
          </div>
          <label><span>Nombre o familia</span><input value={newGuest.name} onChange={(event) => setNewGuest((value) => ({ ...value, name: event.target.value }))} required /></label>
          <label><span>Número de lugares</span><input type="number" min="1" max="20" value={newGuest.passes} onChange={(event) => setNewGuest((value) => ({ ...value, passes: Number(event.target.value) }))} required /></label>
          <button className="button button--primary" type="submit"><Link2 size={16} /> Crear y copiar enlace</button>
        </form>

        <form className="admin-card admin-card--access" onSubmit={validateCheckin}>
          <div className="admin-card__heading">
            <ClipboardCheck size={20} />
            <div><h2>Control de acceso</h2><p>Escanea el QR con la cámara del teléfono o pega el código.</p></div>
          </div>
          <label><span>Código o enlace del QR</span><input value={checkin} onChange={(event) => setCheckin(event.target.value)} placeholder="familia-apellido-1234abcd" required /></label>
          <button className="button button--primary" type="submit"><CheckCircle2 size={16} /> Validar entrada</button>
        </form>
      </section>

      <section className="admin-list" aria-labelledby="guest-list-title">
        <div className="admin-list__header">
          <div><span>Directorio</span><h2 id="guest-list-title">Invitados y estado</h2></div>
          <button className="button button--outline" type="button" onClick={loadSummary} disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={15} /> : <RefreshCw size={15} />} Actualizar
          </button>
        </div>
        <div className="admin-table" role="table" aria-label="Lista de invitados">
          <div className="admin-table__row admin-table__row--head" role="row">
            <span>Invitado</span><span>Cupo</span><span>Confirmación</span><span>Acceso</span><span>Acciones</span>
          </div>
          {summary.guests.map((guest) => {
            const response = guest.attending === null ? "Pendiente" : guest.attending ? `${guest.guests_count} asistirán` : "No asistirá";
            return (
              <div className="admin-table__row" role="row" key={guest.id}>
                <span data-label="Invitado"><strong>{guest.name}</strong><small>{guest.token}</small></span>
                <span data-label="Cupo">{guest.max_passes}</span>
                <span data-label="Confirmación"><i className={`status-pill status-pill--${guest.attending === null ? "pending" : guest.attending ? "yes" : "no"}`}>{response}</i></span>
                <span data-label="Acceso"><i className={`status-pill status-pill--${guest.checked_in_at ? "yes" : "pending"}`}>{guest.checked_in_at ? "Registrado" : "Sin registrar"}</i></span>
                <span data-label="Acciones" className="admin-row-actions">
                  <button type="button" className="icon-button" onClick={() => copyUrl(guest.token)} aria-label={`Copiar enlace de ${guest.name}`}><Copy size={15} /></button>
                  {guest.token !== "familia-castro-cuevas" && <button type="button" className="icon-button icon-button--danger" onClick={() => deleteGuest(guest)} aria-label={`Eliminar invitación de ${guest.name}`}><Trash2 size={15} /></button>}
                </span>
              </div>
            );
          })}
          {!loading && summary.guests.length === 0 && <p className="admin-empty">Todavía no hay invitaciones.</p>}
        </div>
      </section>
    </main>
  );
}
