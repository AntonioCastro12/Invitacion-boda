import { CheckCircle2, Clock3, UserX, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { listGuests } from "../services/guestService";
import { listRsvps } from "../services/rsvpService";

const statusLabel = { confirmed: "Confirmado", declined: "No asistirá", pending: "Pendiente" };

export default function ConfirmationsPage() {
  const { event, loading } = useEvent();
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!event) return;
    try { const guests = await listGuests(event.id); setRows(await listRsvps(event.id, guests)); }
    catch (reason) { setError(reason.message || "No pudimos cargar las confirmaciones."); }
  }, [event]);
  useEffect(() => { load(); const refresh = () => load(); window.addEventListener("rcm-rsvp-change", refresh); return () => window.removeEventListener("rcm-rsvp-change", refresh); }, [load]);
  const filtered = useMemo(() => filter === "all" ? rows : rows.filter((row) => row.status === filter), [filter, rows]);
  if (loading || !event) return <div className="panel-loading">Cargando confirmaciones…</div>;
  if (!event.features?.database_rsvp && !event.features?.form_rsvp) return <section className="locked-feature"><span>Función no incluida</span><h1>Confirmaciones en línea</h1><p>Esta función permite que cada invitado indique si asistirá y cuántas personas acudirán. Las respuestas quedan organizadas en el panel.</p><Link className="button button--dark" to="/panel">Volver al dashboard</Link></section>;
  const confirmed = rows.filter((row) => row.status === "confirmed");
  const passes = confirmed.reduce((total, row) => total + Number(row.attendees || 0), 0);
  return <section><header className="page-header"><div><span className="page-eyebrow">ASISTENCIA</span><h1>Confirmaciones</h1><p>Consulta en tiempo real quién asistirá al evento.</p></div><button className="button button--light" type="button" onClick={load}>Actualizar</button></header>{error && <div className="error-callout">{error}</div>}<div className="confirmation-stats"><article><CheckCircle2 /><span>Confirmados<strong>{confirmed.length}</strong></span></article><article><Users /><span>Asistentes<strong>{passes}</strong></span></article><article><Clock3 /><span>Pendientes<strong>{rows.filter((row) => row.status === "pending").length}</strong></span></article><article><UserX /><span>No asistirán<strong>{rows.filter((row) => row.status === "declined").length}</strong></span></article></div><div className="confirmation-filters">{[["all","Todos"],["confirmed","Confirmados"],["pending","Pendientes"],["declined","No asistirán"]].map(([key,label]) => <button type="button" key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{label}</button>)}</div><div className="confirmation-list">{filtered.map((row) => <article key={row.guest.id}><span className={`confirmation-status confirmation-status--${row.status}`}>{statusLabel[row.status]}</span><div><strong>{row.guest.name}</strong><small>{row.guest.passes} pases asignados · {row.guest.phone || "Sin teléfono"}</small>{row.message && <p>“{row.message}”</p>}</div><div><strong>{row.attendees ?? "—"}</strong><small>asistentes</small>{row.updated_at && <time>{new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(row.updated_at))}</time>}</div></article>)}</div></section>;
}
