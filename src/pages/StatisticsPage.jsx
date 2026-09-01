import { Activity, BarChart3, CheckCircle2, Clipboard, Download, TicketCheck, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { listCheckIns } from "../services/checkInService";
import { listGuests } from "../services/guestService";
import { listRsvps } from "../services/rsvpService";

const csvCell = (value) => {
  let safe = String(value ?? "");
  if (/^[=+\-@]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replaceAll('"', '""')}"`;
};

export default function StatisticsPage() {
  const { event, loading } = useEvent();
  const [guests, setGuests] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!event) return;
    try {
      const nextGuests = await listGuests(event.id);
      const [nextRsvps, nextCheckIns] = await Promise.all([listRsvps(event.id, nextGuests), listCheckIns(event.id, nextGuests)]);
      setGuests(nextGuests); setRsvps(nextRsvps); setCheckIns(nextCheckIns); setNotice("");
    } catch (error) { setNotice(error.message || "No pudimos cargar las estadísticas."); }
  }, [event]);

  useEffect(() => { load(); }, [load]);
  const metrics = useMemo(() => {
    const assigned = guests.reduce((sum, guest) => sum + Number(guest.passes || 0), 0);
    const confirmedRows = rsvps.filter((item) => item.status === "confirmed");
    const confirmed = confirmedRows.reduce((sum, item) => sum + Number(item.attendees || 0), 0);
    const entered = checkIns.reduce((sum, item) => sum + Number(item.attendees || 0), 0);
    const answered = rsvps.filter((item) => item.status !== "pending").length;
    return { assigned, confirmed, entered, answered, pending: rsvps.filter((item) => item.status === "pending").length, declined: rsvps.filter((item) => item.status === "declined").length, responseRate: guests.length ? Math.round((answered / guests.length) * 100) : 0, entryRate: confirmed ? Math.min(100, Math.round((entered / confirmed) * 100)) : 0 };
  }, [checkIns, guests, rsvps]);

  const rsvpByGuest = useMemo(() => new Map(rsvps.map((item) => [item.guest.id, item])), [rsvps]);
  const checkInByGuest = useMemo(() => new Map(checkIns.map((item) => [item.guest_id, item])), [checkIns]);
  const activity = useMemo(() => [
    ...rsvps.filter((item) => item.updated_at).map((item) => ({ id: `r-${item.guest.id}`, at: item.updated_at, title: item.guest.name, detail: item.status === "confirmed" ? `Confirmó ${item.attendees} asistentes` : "Indicó que no asistirá" })),
    ...checkIns.map((item) => ({ id: `c-${item.id}`, at: item.checked_in_at, title: item.guest.name, detail: `Entrada registrada: ${item.attendees} personas` }))
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 10), [checkIns, rsvps]);

  if (loading || !event) return <div className="panel-loading">Calculando estadísticas…</div>;
  if (!event.features?.statistics) return <section className="locked-feature"><span>Función avanzada</span><h1>Estadísticas del evento</h1><p>El reporte operativo y los indicadores están disponibles en Premium Plus y VIP.</p><Link className="button button--dark" to="/panel">Volver al dashboard</Link></section>;

  function exportCsv() {
    const header = ["Familia", "Teléfono", "Pases", "Código", "Estado de confirmación", "Asistentes confirmados", "Personas ingresadas", "Hora de entrada"];
    const rows = guests.map((guest) => { const rsvp = rsvpByGuest.get(guest.id); const checkIn = checkInByGuest.get(guest.id); return [guest.name, guest.phone, guest.passes, guest.code, rsvp?.status || "pending", rsvp?.attendees ?? "", checkIn?.attendees ?? "", checkIn?.checked_in_at || ""]; });
    const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${event.slug}-reporte.csv`; anchor.click(); URL.revokeObjectURL(url);
    setNotice("Reporte CSV descargado correctamente.");
  }

  async function copySummary() {
    const summary = `${event.name}\nFamilias: ${guests.length}\nPases asignados: ${metrics.assigned}\nAsistentes confirmados: ${metrics.confirmed}\nPersonas que ingresaron: ${metrics.entered}\nRespuesta: ${metrics.responseRate}%`;
    try { await navigator.clipboard.writeText(summary); setNotice("Resumen copiado correctamente."); }
    catch { setNotice("No fue posible copiar el resumen en este navegador."); }
  }

  return <section><header className="page-header"><div><span className="page-eyebrow">Información en tiempo real</span><h1>Estadísticas</h1><p>Confirmaciones, aforo y operación del evento.</p></div><div className="page-actions"><button className="button button--light" type="button" onClick={copySummary}><Clipboard size={17} /> Copiar resumen</button><button className="button button--dark" type="button" onClick={exportCsv}><Download size={17} /> Exportar CSV</button></div></header>{notice && <div className="album-notice" role="status">{notice}</div>}<div className="statistics-kpis"><article><Users /><span>Familias<strong>{guests.length}</strong><small>{metrics.assigned} pases asignados</small></span></article><article><CheckCircle2 /><span>Confirmados<strong>{metrics.confirmed}</strong><small>{metrics.responseRate}% de familias respondió</small></span></article><article><TicketCheck /><span>Ingresaron<strong>{metrics.entered}</strong><small>{metrics.entryRate}% del aforo confirmado</small></span></article><article><BarChart3 /><span>Pendientes<strong>{metrics.pending}</strong><small>{metrics.declined} no asistirán</small></span></article></div><div className="statistics-layout"><article className="statistics-card"><header><div><span className="page-eyebrow">Embudo</span><h2>Avance de invitados</h2></div></header>{[["Pases asignados",metrics.assigned,100],["Asistentes confirmados",metrics.confirmed,metrics.assigned ? metrics.confirmed / metrics.assigned * 100 : 0],["Entradas registradas",metrics.entered,metrics.assigned ? metrics.entered / metrics.assigned * 100 : 0]].map(([label,value,percent]) => <div className="metric-progress" key={label}><span>{label}<strong>{value}</strong></span><div><i style={{ width: `${Math.min(100, percent)}%` }} /></div></div>)}</article><article className="statistics-card"><header><div><span className="page-eyebrow">Actividad</span><h2>Movimientos recientes</h2></div><Activity /></header><div className="activity-list">{activity.length ? activity.map((item) => <div key={item.id}><i /><span><strong>{item.title}</strong><small>{item.detail}</small></span><time>{new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.at))}</time></div>) : <p>Aún no hay confirmaciones ni entradas registradas.</p>}</div></article></div></section>;
}
