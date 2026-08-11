import { CalendarCheck, TicketCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { listGuests } from "../services/guestService";

export default function DashboardPage() {
  const { event, loading, error } = useEvent();
  const [guests, setGuests] = useState([]);
  useEffect(() => { if (event) listGuests(event.id).then(setGuests).catch(() => setGuests([])); }, [event]);
  if (loading) return <div className="panel-loading">Cargando evento…</div>;
  if (error || !event) return <div className="error-callout">{error || "No existe un evento asociado a esta cuenta."}</div>;

  const totalPasses = guests.reduce((sum, guest) => sum + Number(guest.passes), 0);
  const eventDate = new Date(`${event.event_date}T12:00:00Z`);
  const day = new Intl.DateTimeFormat("es-MX", { day: "2-digit", timeZone: "UTC" }).format(eventDate);
  const month = new Intl.DateTimeFormat("es-MX", { month: "short", timeZone: "UTC" }).format(eventDate).replace(".", "").toUpperCase();
  const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: "UTC" }).format(eventDate);

  return <section className="dashboard"><header className="page-header"><div><span className="page-eyebrow">Resumen del evento</span><h1>{event.name}</h1><p>{day} {month} {year} · Plan {event.plan}</p></div><Link className="button button--dark" to={`/evento/${event.slug}/${guests[0]?.code || "A7X92"}`} target="_blank">Ver invitación</Link></header><div className="stats-grid"><article><span><Users /></span><div><small>Familias registradas</small><strong>{guests.length}</strong></div></article><article><span><TicketCheck /></span><div><small>Total de pases</small><strong>{totalPasses}</strong></div></article><article><span><CalendarCheck /></span><div><small>Invitaciones listas</small><strong>{guests.length}</strong></div></article></div><section className="dashboard-card"><div><span className="page-eyebrow">Próximo evento</span><h2>{event.name}</h2><p>{event.ceremony_name}</p></div><div className="event-date-box"><strong>{day}</strong><span>{month}<br />{year}</span></div></section></section>;
}
