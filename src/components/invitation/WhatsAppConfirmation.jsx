import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { createWhatsAppUrl } from "../../utils/whatsapp";

export default function WhatsAppConfirmation({ event, guest, compact = false }) {
  const confirmationContacts = event.template_config?.confirmation_whatsapps?.length
    ? event.template_config.confirmation_whatsapps
    : [event.whatsapp];
  const [form, setForm] = useState({
    name: guest.name,
    attendees: guest.passes,
    attending: "yes",
    message: "",
  });
  function submit(e) {
    e.preventDefault();
    const targetPhone = e.nativeEvent.submitter?.value || confirmationContacts[0];
    const status =
      form.attending === "yes"
        ? "Sí podremos acompañarlos"
        : "Lamentablemente no podremos asistir";
    const message = `Hola, somos ${form.name}.\n\n${status} a la boda de ${event.name}.\n\nConfirmamos ${form.attendees} ${Number(form.attendees) === 1 ? "persona" : "personas"}.${form.message ? `\n\nMensaje: ${form.message}` : ""}\n\nGracias.`;
    window.open(
      createWhatsAppUrl(targetPhone, message),
      "_blank",
      "noopener,noreferrer",
    );
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
      <form className="rsvp-form" onSubmit={submit}>
        <label>
          Nombre completo
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Número de invitados
          <select
            value={form.attendees}
            onChange={(e) => setForm({ ...form, attendees: e.target.value })}
          >
            {Array.from({ length: guest.passes }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>
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
          {confirmationContacts.map((phone, index) => <button className="button button--olive" type="submit" value={phone} key={phone}>
            <MessageCircle size={18} /> {confirmationContacts.length > 1 ? `WhatsApp ${index + 1}` : "Confirmar asistencia"}
            {confirmationContacts.length > 1 && <small>{phone}</small>}
          </button>)}
        </div>
      </form>
    </section>
  );
}
