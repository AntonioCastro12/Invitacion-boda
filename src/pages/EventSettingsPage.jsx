import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { updateEvent } from "../services/eventService";

export default function EventSettingsPage() {
  const { event, loading, setEvent } = useEvent();
  const [form, setForm] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (event) setForm(event); }, [event]);
  if (loading || !form) return <div className="panel-loading">Cargando configuración…</div>;
  if (!event.features?.admin_panel) return <section className="locked-feature"><span>Función no incluida</span><h1>Configuración del evento</h1><p>Esta sección está disponible cuando el evento incluye panel administrativo.</p><Link className="button button--dark" to="/panel">Volver al dashboard</Link></section>;

  async function submit(e) {
    e.preventDefault();
    try {
      const saved = await updateEvent(event.id, {
        whatsapp: form.whatsapp,
        ceremony_name: form.ceremony_name,
        ceremony_address: form.ceremony_address,
        reception_name: form.reception_name,
        reception_address: form.reception_address
      });
      setEvent(saved);
      setNotice("Configuración guardada correctamente.");
    } catch (error) { setNotice(error.message); }
  }

  return <section><header className="page-header"><div><span className="page-eyebrow">Evento</span><h1>Configuración</h1><p>Información utilizada en la invitación personalizada del evento.</p></div></header>{notice && <div className="toast">{notice}</div>}<div className="custom-design-note"><strong>Diseño personalizado por RCM Code Dev</strong><span>El cliente administra su información y servicios; el diseño no se cambia desde una plantilla.</span></div><form className="settings-card" onSubmit={submit}><div className="form-grid"><label>Nombre del evento<input value={form.name} disabled /></label><label>Slug público<input value={form.slug} disabled /></label><label>Tipo de evento<input value={form.event_type} disabled /></label><label>Plan<input value={form.plan} disabled /></label><label>WhatsApp de confirmación<input value={form.whatsapp || ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></label></div><hr /><h2>Ubicaciones</h2><div className="form-grid"><label>Nombre de la ceremonia<input value={form.ceremony_name || ""} onChange={(e) => setForm({ ...form, ceremony_name: e.target.value })} /></label><label>Dirección de ceremonia<input value={form.ceremony_address || ""} onChange={(e) => setForm({ ...form, ceremony_address: e.target.value })} /></label><label>Nombre de la recepción<input value={form.reception_name || ""} onChange={(e) => setForm({ ...form, reception_name: e.target.value })} /></label><label>Dirección de recepción<input value={form.reception_address || ""} onChange={(e) => setForm({ ...form, reception_address: e.target.value })} /></label></div><button className="button button--gold" type="submit"><Save size={18} /> Guardar cambios</button></form></section>;
}
