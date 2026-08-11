import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useEvent } from "../hooks/useEvent";
import { updateEvent } from "../services/eventService";
import { availableTemplates } from "../templates/InvitationTemplateRenderer";

export default function EventSettingsPage() {
  const { event, loading, setEvent } = useEvent();
  const [form, setForm] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (event) setForm(event); }, [event]);
  if (loading || !form) return <div className="panel-loading">Cargando configuración…</div>;

  async function submit(e) {
    e.preventDefault();
    try {
      const saved = await updateEvent(event.id, {
        template_key: form.template_key,
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

  return <section><header className="page-header"><div><span className="page-eyebrow">Evento</span><h1>Configuración</h1><p>Información y diseño utilizados en las invitaciones de este evento.</p></div></header>{notice && <div className="toast">{notice}</div>}<form className="settings-card" onSubmit={submit}><div className="form-grid"><label>Nombre del evento<input value={form.name} disabled /></label><label>Slug público<input value={form.slug} disabled /></label><label>Tipo de evento<input value={form.event_type} disabled /></label><label>Plan<input value={form.plan} disabled /></label><label>Plantilla de invitación<select value={form.template_key || "elegante-clasica"} onChange={(e) => setForm({ ...form, template_key: e.target.value })}>{availableTemplates.map((template) => <option key={template.key} value={template.key}>{template.name}</option>)}</select><small>{availableTemplates.find((item) => item.key === (form.template_key || "elegante-clasica"))?.description}</small></label><label>WhatsApp de confirmación<input value={form.whatsapp || ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></label></div><hr /><h2>Ubicaciones</h2><div className="form-grid"><label>Nombre de la ceremonia<input value={form.ceremony_name || ""} onChange={(e) => setForm({ ...form, ceremony_name: e.target.value })} /></label><label>Dirección de ceremonia<input value={form.ceremony_address || ""} onChange={(e) => setForm({ ...form, ceremony_address: e.target.value })} /></label><label>Nombre de la recepción<input value={form.reception_name || ""} onChange={(e) => setForm({ ...form, reception_name: e.target.value })} /></label><label>Dirección de recepción<input value={form.reception_address || ""} onChange={(e) => setForm({ ...form, reception_address: e.target.value })} /></label></div><button className="button button--gold" type="submit"><Save size={18} /> Guardar cambios</button></form></section>;
}
