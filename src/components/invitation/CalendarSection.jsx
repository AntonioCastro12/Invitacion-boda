import { CalendarDays, Download } from "lucide-react";
import { createCalendarUrl } from "../../utils/calendar";

function icsUrl(event) {
  const start = `${event.event_date.replaceAll("-", "")}T${String(event.event_time || "17:00").replaceAll(":", "").slice(0, 6).padEnd(6, "0")}`;
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `SUMMARY:${event.event_type} de ${event.name}`, `DTSTART:${start}`, `LOCATION:${event.ceremony_name}, ${event.ceremony_address}`, `DESCRIPTION:Celebración de ${event.name}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;
}

export default function CalendarSection({ event }) {
  const displayDate = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${event.event_date}T12:00:00Z`));
  const displayTime = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(new Date(`${event.event_date}T${event.event_time || "17:00:00"}`));
  return <section className="invitation-section calendar-card"><CalendarDays className="section-icon" /><p className="section-intro">Guarda nuestro día</p><h2>Agrégalo a tu calendario</h2><p>Conserva la fecha, la hora y la ubicación en tu teléfono.</p><div className="calendar-summary"><strong>{displayDate}</strong><span>{displayTime} · {event.ceremony_name}</span></div><div className="button-row"><a className="button button--gold" href={createCalendarUrl(event)} target="_blank" rel="noreferrer"><CalendarDays size={17} /> Google Calendar</a><a className="button button--outline" href={icsUrl(event)} download={`${event.slug}.ics`}><Download size={17} /> Descargar evento</a></div></section>;
}
