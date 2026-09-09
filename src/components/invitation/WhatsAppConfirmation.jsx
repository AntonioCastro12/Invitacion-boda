import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { submitRsvp } from "../../services/rsvpService";
import { createWhatsAppUrl } from "../../utils/whatsapp";

export default function WhatsAppConfirmation({ event, guest, compact = false }) {
  const confirmationContacts = event.template_config?.confirmation_whatsapps?.length
    ? event.template_config.confirmation_whatsapps
    : [event.whatsapp];
  const [form, setForm] = useState({
    name: guest.name,
    adults: guest.passes,
    children: 0,
    attending: "yes",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const deadline = event.template_config?.rsvp_deadline;
  const deadlineLabel = deadline
    ? new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" })
        .format(new Date(`${deadline}T12:00:00`))
    : "";
  async function submit(e) {
    e.preventDefault();
    const targetPhone = e.nativeEvent.submitter?.value || confirmationContacts[0];
    const status =
      form.attending === "yes"
        ? "Sí podremos acompañarlos"
        : "Lamentablemente no podremos asistir";
    const adults = form.attending === "yes" ? Number(form.adults) : 0;
    const children = form.attending === "yes" ? Number(form.children) : 0;
    const invitationTotal = `${adults} ${adults === 1 ? "adulto" : "adultos"}${children ? ` y ${children} ${children === 1 ? "niño" : "niños"}` : ""}`;
    const attendanceDetail = form.attending === "yes" ? `\n\nConfirmamos ${invitationTotal}.` : "";
    const message = `Hola, somos ${form.name}.\n\n${status} a la boda de ${event.name}.${attendanceDetail}${form.message ? `\n\nMensaje: ${form.message}` : ""}\n\nGracias.`;
    setSaving(true);
    setError("");
    try {
      if (event.features?.database_rsvp || event.features?.form_rsvp) {
        await submitRsvp(event, guest, form);
      }
      window.location.assign(createWhatsAppUrl(targetPhone, message));
    } catch (reason) {
      setError(reason.message || "No fue posible guardar la confirmación.");
      setSaving(false);
    }
  }
  return (
    <section className={`invitation-section rsvp-section${compact ? " rsvp-section--embedded" : ""}`}>
      {!compact && <MessageCircle className="section-icon" />}
      <p className="section-intro">CONFIRMACIÓN DE ASISTENCIA</p>
      <h2>¿Podrás acompañarnos?</h2>
      <p>
        Completa tus datos y enviaremos tu respuesta a los anfitriones mediante
        WhatsApp.
      </p>
      {deadlineLabel && <p className="rsvp-deadline">Favor de confirmar antes del <strong>{deadlineLabel}</strong>.</p>}
      {error && <div className="error-callout" role="alert">{error}</div>}
      <form className="rsvp-form" onSubmit={submit}>
        <label>
          Nombre completo
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        {form.attending === "yes" && <div className="rsvp-guests">
          <label>
            Adultos
            <select
              value={form.adults}
              onChange={(e) => setForm({ ...form, adults: e.target.value })}
            >
              {Array.from({ length: guest.passes }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Niños
            <select
              value={form.children}
              onChange={(e) => setForm({ ...form, children: e.target.value })}
            >
              {Array.from(
                { length: Math.max(0, guest.passes - Number(form.adults)) + 1 },
                (_, index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>}
        {form.attending === "yes" && <p className="rsvp-guests__example">
          Total seleccionado:{" "}
          {Number(form.adults) + Number(form.children)} de {guest.passes}
        </p>}
        <fieldset>
          <legend>¿Podrás acompañarnos?</legend>
          <label>
            <input
              type="radio"
              name="attending"
              value="yes"
              checked={form.attending === "yes"}
              onChange={(e) => setForm({ ...form, attending: e.target.value })}
            />{" "}
            Sí, ahí estaré
          </label>
          <label>
            <input
              type="radio"
              name="attending"
              value="no"
              checked={form.attending === "no"}
              onChange={(e) => setForm({ ...form, attending: e.target.value })}
            />{" "}
            Lo siento, no podré asistir
          </label>
        </fieldset>
        <label>
          Mensaje para los novios <small>Opcional</small>
          <textarea
            rows="4"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </label>
        {confirmationContacts.length > 1 && <p className="confirmation-help">Envía tu confirmación a nuestros dos contactos:</p>}
        <div className="confirmation-actions">
          {confirmationContacts.map((phone, index) => <button className="button button--olive" type="submit" value={phone} key={phone} disabled={saving}>
            <MessageCircle size={18} /> {saving ? "Guardando…" : confirmationContacts.length > 1 ? `WhatsApp ${index + 1}` : "Confirmar asistencia"}
            {confirmationContacts.length > 1 && <small>{phone}</small>}
          </button>)}
        </div>
      </form>
    </section>
  );
}
