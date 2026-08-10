"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, Copy, ExternalLink, Heart, Link2, LoaderCircle, LogOut, Plus, RefreshCw, ShieldCheck, TicketCheck, Trash2, UserCheck, Users } from "lucide-react";
import { weddingData } from "../data/weddingData";

const STORAGE_KEY = "wedding-demo-guests";
const demoGuests = [
  { id: "demo-1", token: "familia-castro-cuevas", name: "Familia Castro Cuevas", max_passes: 4, attending: true, guests_count: 4, checked_in_at: null },
  { id: "demo-2", token: "familia-ramirez-demo", name: "Familia Ramírez", max_passes: 3, attending: null, guests_count: null, checked_in_at: null },
  { id: "demo-3", token: "ana-y-luis-demo", name: "Ana y Luis", max_passes: 2, attending: false, guests_count: 0, checked_in_at: null },
];

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 42);
}

function getStats(guests) {
  return guests.reduce((totals, guest) => ({
    invitations: totals.invitations + 1,
    invited: totals.invited + guest.max_passes,
    confirmed: totals.confirmed + (guest.attending ? guest.guests_count ?? 0 : 0),
    pending: totals.pending + (guest.attending === null ? 1 : 0),
    declined: totals.declined + (guest.attending === false ? 1 : 0),
    checkIns: totals.checkIns + (guest.checked_in_at ? 1 : 0),
  }), { invitations: 0, invited: 0, confirmed: 0, pending: 0, declined: 0, checkIns: 0 });
}

function invitationUrl(guest) {
  const params = new URLSearchParams({
    invitado: guest.name,
    lugares: String(guest.max_passes),
    token: guest.token,
  });
  return `${window.location.origin}/?${params}`;
}

export default function AdminDashboard({ adminName }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ type: "idle", message: "" });
  const [checkin, setCheckin] = useState("");
  const [newGuest, setNewGuest] = useState({ name: "", passes: 2 });

  const saveGuests = useCallback((records) => {
    setGuests(records);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, []);

  const loadSummary = useCallback(() => {
    setLoading(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    let records = stored ? JSON.parse(stored) : demoGuests;
    const demoRsvp = localStorage.getItem("wedding-demo-rsvp:familia-castro-cuevas");
    if (demoRsvp) {
      const response = JSON.parse(demoRsvp);
      records = records.map((guest) => guest.token === "familia-castro-cuevas"
        ? { ...guest, attending: response.attending, guests_count: response.guests_count }
        : guest);
    }
    saveGuests(records);
    const initialCode = new URLSearchParams(window.location.search).get("checkin");
    if (initialCode) setCheckin(initialCode);
    setLoading(false);
  }, [saveGuests]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const createGuest = async (event) => {
    event.preventDefault();
    const guest = {
      id: crypto.randomUUID(),
      token: `${slugify(newGuest.name) || "invitado"}-${crypto.randomUUID().slice(0, 8)}`,
      name: newGuest.name.trim(),
      max_passes: Number(newGuest.passes),
      attending: null,
      guests_count: null,
      checked_in_at: null,
    };
    saveGuests([guest, ...guests]);
    await navigator.clipboard.writeText(invitationUrl(guest));
    setNewGuest({ name: "", passes: 2 });
    setNotice({ type: "success", message: "Invitación simulada creada y enlace copiado." });
  };

  const validateCheckin = (event) => {
    event.preventDefault();
    let token = checkin.trim();
    try {
      const url = new URL(token);
      token = url.searchParams.get("checkin") ?? url.searchParams.get("token") ?? token;
    } catch {
      // El campo también acepta el token directamente.
    }
    const guest = guests.find((record) => record.token === token);
    if (!guest) {
      setNotice({ type: "error", message: "El código no pertenece a una invitación de demostración." });
      return;
    }
    if (guest.checked_in_at) {
      setNotice({ type: "error", message: "Este pase ya fue registrado en la demostración." });
      return;
    }
    saveGuests(guests.map((record) => record.id === guest.id ? { ...record, checked_in_at: new Date().toISOString() } : record));
    setNotice({ type: "success", message: `Acceso autorizado para ${guest.name} (${guest.max_passes} lugares).` });
    setCheckin("");
  };

  const copyUrl = async (guest) => {
    await navigator.clipboard.writeText(invitationUrl(guest));
    setNotice({ type: "success", message: "Enlace personalizado copiado." });
  };

  const deleteGuest = (guest) => {
    if (!window.confirm(`¿Eliminar la invitación de ${guest.name}?`)) return;
    saveGuests(guests.filter((record) => record.id !== guest.id));
    setNotice({ type: "success", message: "Invitación eliminada de la demostración." });
  };

  const stats = getStats(guests);
  const statCards = [
    ["Invitaciones", stats.invitations, TicketCheck],
    ["Personas invitadas", stats.invited, Users],
    ["Confirmadas", stats.confirmed, UserCheck],
    ["Pendientes", stats.pending, RefreshCw],
    ["No asistirán", stats.declined, Heart],
    ["Accesos", stats.checkIns, ShieldCheck],
  ];

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span>Invitación VIP · {weddingData.couple.bride} &amp; {weddingData.couple.groom}</span>
          <h1>Panel de invitados</h1>
          <p>Hola, {adminName}. Esta versión simula la gestión completa sin servidor ni base de datos.</p>
        </div>
        <div className="admin-header__actions">
          <a className="button button--outline" href="/" target="_blank" rel="noreferrer">
            Ver invitación <ExternalLink size={14} />
          </a>
          <a className="button button--outline" href="/">
            Salir <LogOut size={14} />
          </a>
        </div>
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
            <div><h2>Nueva invitación</h2><p>Genera un enlace personalizado de muestra.</p></div>
          </div>
          <label><span>Nombre o familia</span><input value={newGuest.name} onChange={(event) => setNewGuest((value) => ({ ...value, name: event.target.value }))} required /></label>
          <label><span>Número de lugares</span><input type="number" min="1" max="20" value={newGuest.passes} onChange={(event) => setNewGuest((value) => ({ ...value, passes: Number(event.target.value) }))} required /></label>
          <button className="button button--primary" type="submit"><Link2 size={16} /> Crear y copiar enlace</button>
        </form>

        <form className="admin-card admin-card--access" onSubmit={validateCheckin}>
          <div className="admin-card__heading">
            <ClipboardCheck size={20} />
            <div><h2>Control de acceso</h2><p>Pega el código para simular el registro del pase.</p></div>
          </div>
          <label><span>Código o enlace del QR</span><input value={checkin} onChange={(event) => setCheckin(event.target.value)} placeholder="familia-castro-cuevas" required /></label>
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
          {guests.map((guest) => {
            const response = guest.attending === null ? "Pendiente" : guest.attending ? `${guest.guests_count} asistirán` : "No asistirá";
            return (
              <div className="admin-table__row" role="row" key={guest.id}>
                <span data-label="Invitado"><strong>{guest.name}</strong><small>{guest.token}</small></span>
                <span data-label="Cupo">{guest.max_passes}</span>
                <span data-label="Confirmación"><i className={`status-pill status-pill--${guest.attending === null ? "pending" : guest.attending ? "yes" : "no"}`}>{response}</i></span>
                <span data-label="Acceso"><i className={`status-pill status-pill--${guest.checked_in_at ? "yes" : "pending"}`}>{guest.checked_in_at ? "Registrado" : "Sin registrar"}</i></span>
                <span data-label="Acciones" className="admin-row-actions">
                  <button type="button" className="icon-button" onClick={() => copyUrl(guest)} aria-label={`Copiar enlace de ${guest.name}`}><Copy size={15} /></button>
                  {guest.token !== "familia-castro-cuevas" && <button type="button" className="icon-button icon-button--danger" onClick={() => deleteGuest(guest)} aria-label={`Eliminar invitación de ${guest.name}`}><Trash2 size={15} /></button>}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
