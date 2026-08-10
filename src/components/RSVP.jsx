"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function RSVP({ couple, whatsapp, maxGuests, token }) {
  const [form, setForm] = useState({ name: "", guests: maxGuests, attendance: "yes", message: "" });
  const [status, setStatus] = useState({ type: "idle", message: "" });

  useEffect(() => {
    setForm((current) => ({ ...current, guests: maxGuests }));
  }, [maxGuests]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const attending = form.attendance === "yes";
    const guests = attending ? Number(form.guests) : 0;
    localStorage.setItem(`wedding-demo-rsvp:${token}`, JSON.stringify({
      attending,
      guests_count: guests,
      name: form.name.trim(),
      message: form.message.trim(),
    }));

    setStatus({ type: "success", message: "¡Confirmación simulada! Ya puedes mostrarla en el panel de demostración." });

    const answer = attending
      ? `Confirmamos nuestra asistencia a la boda de ${couple.bride} y ${couple.groom}.`
      : `Lamentablemente no podremos acompañarlos en la boda de ${couple.bride} y ${couple.groom}.`;
    const guestsLine = attending ? `\nNúmero de invitados: ${guests}.` : "";
    const note = form.message.trim() ? `\nMensaje: ${form.message.trim()}` : "";
    const text = `Hola, somos ${form.name.trim()}.\n${answer}${guestsLine}${note}`;
    const localNumber = whatsapp.replace(/\D/g, "").slice(-10);
    if (!/^0+$/.test(localNumber)) {
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="section rsvp-section" aria-labelledby="rsvp-title">
      <SectionHeading
        eyebrow="R.S.V.P."
        title="Confirma tu asistencia"
        description="Tu presencia hará este día todavía más especial."
      />
      <motion.form
        className="rsvp-form"
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <label>
          <span>Nombre completo</span>
          <input name="name" type="text" value={form.name} onChange={update} required autoComplete="name" />
        </label>
        <label>
          <span>Número de invitados</span>
          <select name="guests" value={form.guests} onChange={update}>
            {Array.from({ length: maxGuests }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>¿Podrás acompañarnos?</legend>
          <label className="radio-card">
            <input type="radio" name="attendance" value="yes" checked={form.attendance === "yes"} onChange={update} />
            <span><Check size={16} /> Sí, ahí estaré</span>
          </label>
          <label className="radio-card">
            <input type="radio" name="attendance" value="no" checked={form.attendance === "no"} onChange={update} />
            <span>Lo siento, no podré asistir</span>
          </label>
        </fieldset>
        <label>
          <span>Mensaje para los novios <small>Opcional</small></span>
          <textarea name="message" value={form.message} onChange={update} rows="4" />
        </label>
        <button className="button button--primary" type="submit">
          <MessageCircle size={18} /> Confirmar asistencia
        </button>
        {status.message && <p className={`form-status form-status--${status.type}`} role="status">{status.message}</p>}
      </motion.form>
    </section>
  );
}
