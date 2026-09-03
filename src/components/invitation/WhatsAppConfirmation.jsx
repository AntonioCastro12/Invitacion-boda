import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { createWhatsAppUrl } from "../../utils/whatsapp";

export default function WhatsAppConfirmation({ event, guest, compact = false }) {
  const [form, setForm] = useState({ name: guest.name, attendees: guest.passes, attending: "yes", message: "" });
  function submit(e) {
    e.preventDefault();
    const status = form.attending === "yes" ? "Sí podremos acompañarlos" : "Lamentablemente no podremos asistir";
    const message = `Hola, somos ${form.name}.\n\n${status} a la boda de ${event.name}.\n\nConfirmamos ${form.attendees} ${Number(form.attendees) === 1 ? "persona" : "personas"}.${form.message ? `\n\nMensaje: ${form.message}` : ""}\n\nGracias.`;
    window.open(createWhatsAppUrl(event.whatsapp, message), "_blank", "noopener,noreferrer");
  }
  const content = <><MessageCircle className={compact ? "confirmation-inline-icon" : "section-icon"} /><p className="section-intro">Confirmación de asistencia</p><h2>¿Podrán acompañarnos?</h2><p>Envía la respuesta y un mensaje para los novios mediante WhatsApp.</p><form className="rsvp-form" onSubmit={submit}>{!compact && <label>Nombre completo<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>}<label>Número de asistentes<select value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })}>{Array.from({ length: guest.passes }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label><fieldset><legend>¿Podrán acompañarnos?</legend><label><input type="radio" name="attending" value="yes" checked={form.attending === "yes"} onChange={(e) => setForm({ ...form, attending: e.target.value })} /> Sí, ahí estaremos</label><label><input type="radio" name="attending" value="no" checked={form.attending === "no"} onChange={(e) => setForm({ ...form, attending: e.target.value })} /> Lo sentimos, no podremos asistir</label></fieldset><label>Mensaje para los novios <small>Opcional</small><textarea rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label><button className="button button--olive" type="submit"><MessageCircle size={18} /> Confirmar por WhatsApp</button></form></>;
  if (compact) return <div className="rsvp-section rsvp-section--embedded">{content}</div>;
  return <section className="invitation-section rsvp-section">{content}</section>;
}
