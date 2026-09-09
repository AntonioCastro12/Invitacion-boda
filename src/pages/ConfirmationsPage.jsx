import { CheckCircle2, Clock3, Download, UserX, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { listGuests } from "../services/guestService";
import { listRsvps } from "../services/rsvpService";

const statusLabel = { confirmed: "Confirmado", declined: "No asistirá", pending: "Pendiente" };

function excelCell(value) {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return safe.replace(/[\t\r\n]+/g, " ");
}

function phoneExcelCell(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? `="${digits}"` : "";
}

function unicodeExcelBlob(value) {
  const buffer = new ArrayBuffer(2 + value.length * 2);
  const view = new DataView(buffer);
  view.setUint16(0, 0xfeff, true);
  for (let index = 0; index < value.length; index += 1) {
    view.setUint16(2 + index * 2, value.charCodeAt(index), true);
  }
  return new Blob([buffer], { type: "text/tab-separated-values;charset=utf-16le" });
}

export default function ConfirmationsPage() {
  const { event, loading } = useEvent();
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const load = useCallback(async () => {
    if (!event) return;
    try { const guests = await listGuests(event.id); setRows(await listRsvps(event.id, guests)); setUpdatedAt(new Date()); setError(""); }
    catch (reason) { setError(reason.message || "No pudimos cargar las confirmaciones."); }
  }, [event]);
  useEffect(() => {
    load();
    const refresh = () => load();
    const interval = window.setInterval(load, 15000);
    window.addEventListener("rcm-rsvp-change", refresh);
    return () => { window.clearInterval(interval); window.removeEventListener("rcm-rsvp-change", refresh); };
  }, [load]);
  const filtered = useMemo(() => filter === "all" ? rows : rows.filter((row) => row.status === filter), [filter, rows]);
  if (loading || !event) return <div className="panel-loading">Cargando confirmaciones…</div>;
  if (!event.features?.database_rsvp && !event.features?.form_rsvp) return <section className="locked-feature"><span>Función no incluida</span><h1>Confirmaciones en línea</h1><p>Esta función permite que cada invitado indique si asistirá y cuántas personas acudirán. Las respuestas quedan organizadas en el panel.</p><Link className="button button--dark" to="/panel">Volver al dashboard</Link></section>;
  const confirmed = rows.filter((row) => row.status === "confirmed");
  const passes = confirmed.reduce((total, row) => total + Number(row.attendees || 0), 0);
  function exportExcel() {
    const headers = ["Familia o invitado", "Teléfono", "Lugares asignados", "Adultos", "Niños", "Lugares confirmados", "Mensaje", "Última actualización"];
    const data = confirmed.map((row) => [row.guest.name, phoneExcelCell(row.guest.phone), excelCell(row.guest.passes), excelCell(row.adults ?? ""), excelCell(row.children ?? ""), excelCell(row.attendees), excelCell(row.message), excelCell(row.updated_at ? new Date(row.updated_at).toLocaleString("es-MX") : "")]);
    const excelText = `sep=\t\r\n${headers.map(excelCell).join("\t")}\r\n${data.map((line) => line.join("\t")).join("\r\n")}`;
    const url = URL.createObjectURL(unicodeExcelBlob(excelText));
    const link = document.createElement("a");
    link.href = url;
    link.download = `confirmaciones-${event.slug}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return <section><header className="page-header"><div><span className="page-eyebrow">ASISTENCIA</span><h1>Confirmaciones</h1><p>Consulta quién asistirá y cuántos lugares confirmó cada familia.</p>{updatedAt && <small>Actualización automática cada 15 segundos · Última revisión: {updatedAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</small>}</div><div className="page-actions"><button className="button button--light" type="button" onClick={load}>Actualizar</button><button className="button button--dark" type="button" onClick={exportExcel}><Download size={17} /> Descargar Excel</button></div></header>{error && <div className="error-callout">{error}</div>}<div className="confirmation-stats"><article><CheckCircle2 /><span>Confirmados<strong>{confirmed.length}</strong></span></article><article><Users /><span>Asistentes<strong>{passes}</strong></span></article><article><Clock3 /><span>Pendientes<strong>{rows.filter((row) => row.status === "pending").length}</strong></span></article><article><UserX /><span>No asistirán<strong>{rows.filter((row) => row.status === "declined").length}</strong></span></article></div><div className="confirmation-filters">{[["all","Todos"],["confirmed","Confirmados"],["pending","Pendientes"],["declined","No asistirán"]].map(([key,label]) => <button type="button" key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{label}</button>)}</div><div className="confirmation-list">{filtered.map((row) => <article key={row.guest.id}><span className={`confirmation-status confirmation-status--${row.status}`}>{statusLabel[row.status]}</span><div><strong>{row.guest.name}</strong><small>{row.guest.passes} pases asignados · {row.guest.phone || "Sin teléfono"}</small>{row.message && <p>“{row.message}”</p>}</div><div><strong>{row.attendees ?? "—"}</strong><small>lugares confirmados</small>{row.adults != null && <span className="confirmation-breakdown">{row.adults} adulto{row.adults === 1 ? "" : "s"} · {row.children ?? 0} niño{row.children === 1 ? "" : "s"}</span>}{row.updated_at && <time>{new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(row.updated_at))}</time>}</div></article>)}</div></section>;
}
