import { CalendarCheck, CheckCircle2, ExternalLink, LockKeyhole, TicketCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { featureCatalog } from "../data/packageCatalog";
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
  const enabled = featureCatalog.filter((feature) => event.features?.[feature.key]);

  const invitationHref = event.invitation_url || `/evento/${event.slug}/${guests[0]?.code || "A7X92"}`;
  return <section className="dashboard">
    <header className="page-header"><div><span className="page-eyebrow">Resumen del evento</span><h1>{event.name}</h1><p>{day} {month} {year} · Plan {event.plan}</p></div><a className="button button--dark" href={invitationHref} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Ver invitación</a></header>
    {event.features?.admin_panel ? <div className="stats-grid"><article><span><Users /></span><div><small>Familias registradas</small><strong>{guests.length}</strong></div></article><article><span><TicketCheck /></span><div><small>Total de pases</small><strong>{totalPasses}</strong></div></article><article><span><CalendarCheck /></span><div><small>Invitaciones listas</small><strong>{guests.length}</strong></div></article></div> : <div className="plan-restriction"><LockKeyhole /><div><strong>Panel informativo</strong><p>Tu paquete permite consultar la invitación y sus servicios. La gestión de invitados se habilita con Premium Plus.</p></div></div>}
    <section className="dashboard-card"><div><span className="page-eyebrow">Invitación personalizada</span><h2>{event.name}</h2><p>Diseñada exclusivamente por RCM Code Dev</p></div><div className="event-date-box"><strong>{day}</strong><span>{month}<br />{year}</span></div></section>
    <section className="client-services"><header><div><span className="page-eyebrow">Tu contratación</span><h2>Servicios activos</h2></div><strong>{enabled.length} de {featureCatalog.length}</strong></header><div>{featureCatalog.map((feature) => <article className={event.features?.[feature.key] ? "is-active" : ""} key={feature.key}>{event.features?.[feature.key] ? <CheckCircle2 /> : <LockKeyhole />}<span>{feature.label}</span><small>{event.features?.[feature.key] ? "Disponible" : "No incluido"}</small></article>)}</div></section>
  </section>;
}
