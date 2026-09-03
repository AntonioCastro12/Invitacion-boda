import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { submitRsvp } from "../../services/rsvpService";

export default function RsvpFormDemo({ event, guest }) {
  const [form, setForm] = useState({
    attendees: guest.passes,
    attending: "yes",
    message: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(eventSubmit) {
    eventSubmit.preventDefault();
    setSaving(true);
    setError("");
    try {
      await submitRsvp(event, guest, form);
      setSaved(true);
    } catch (reason) {
      setError(reason.message || "No fue posible guardar la confirmación.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="invitation-section rsvp-section">
      <Send className="section-icon" />
      <p className="section-intro">CONFIRMACIÓN DE ASISTENCIA</p>
      <h2>¿Nos acompañarán?</h2>
      <p>
        Indiquen si podrán asistir y cuántas personas acudirán. La respuesta
        quedará disponible en el panel privado de los anfitriones.
      </p>
      {error && <div className="error-callout">{error}</div>}
      {saved ? (
        <div className="rsvp-success">
          <CheckCircle2 />
          <strong>Confirmación recibida</strong>
          <span>Los anfitriones ya pueden consultar su respuesta.</span>
          <button
            className="button button--outline"
            type="button"
            onClick={() => setSaved(false)}
          >
            Modificar respuesta
          </button>
        </div>
      ) : (
        <form className="rsvp-form" onSubmit={submit}>
          <label>
            Invitación para
            <input value={guest.name} disabled />
          </label>
          <label>
            Número de asistentes
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
            <legend>¿Podrán acompañarnos?</legend>
            <label>
              <input
                type="radio"
                name="attending"
                value="yes"
                checked={form.attending === "yes"}
                onChange={(e) =>
                  setForm({ ...form, attending: e.target.value })
                }
              />{" "}
              Sí, ahí estaremos
            </label>
            <label>
              <input
                type="radio"
                name="attending"
                value="no"
                checked={form.attending === "no"}
                onChange={(e) =>
                  setForm({ ...form, attending: e.target.value })
                }
              />{" "}
              No podremos asistir
            </label>
          </fieldset>
          <label>
            Mensaje <small>Opcional</small>
            <textarea
              rows="3"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>
          <button
            className="button button--olive"
            type="submit"
            disabled={saving}
          >
            <Send size={17} /> {saving ? "Guardando…" : "Enviar confirmación"}
          </button>
        </form>
      )}
    </section>
  );
}
