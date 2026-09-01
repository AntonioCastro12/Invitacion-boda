import { AlertCircle, CheckCircle2, MessageCircle, SkipForward, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createWhatsAppUrl, invitationMessage } from "../utils/whatsapp";

export default function BulkWhatsAppModal({ event, guests, onClose }) {
  const baseUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  const recipients = useMemo(() => guests.filter((guest) => createWhatsAppUrl(guest.phone, "Prueba")), [guests]);
  const withoutPhone = guests.length - recipients.length;
  const [position, setPosition] = useState(0);
  const [sent, setSent] = useState([]);
  const current = recipients[position];
  const completed = recipients.length > 0 && position >= recipients.length;

  function openCurrent() {
    if (!current) return;
    const invitationUrl = `${baseUrl}/evento/${event.slug}/${current.code}`;
    const whatsappUrl = createWhatsAppUrl(current.phone, invitationMessage(event, current, invitationUrl));
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setSent((currentSent) => [...currentSent, current.id]);
    setPosition((currentPosition) => currentPosition + 1);
  }

  function skipCurrent() {
    setPosition((currentPosition) => currentPosition + 1);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(eventMouse) => { if (eventMouse.target === eventMouse.currentTarget) onClose(); }}>
      <section className="modal bulk-send-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-send-title">
        <header><div><span className="page-eyebrow">Envío por WhatsApp</span><h2 id="bulk-send-title">Enviar invitaciones a todos</h2></div><button type="button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button></header>

        <div className="bulk-send-note"><AlertCircle size={20} /><p><strong>WhatsApp requiere confirmar cada envío.</strong> Abriremos un mensaje personalizado por familia; revísalo y toca Enviar en WhatsApp. Al regresar, continúa con la siguiente invitación.</p></div>

        {!recipients.length ? <div className="bulk-send-empty"><AlertCircle /><strong>No hay teléfonos disponibles</strong><span>Agrega un teléfono a los invitados para poder enviarles su invitación.</span></div> : completed ? <div className="bulk-send-complete"><CheckCircle2 /><strong>Lista de envío completada</strong><span>Abriste {sent.length} de {recipients.length} invitaciones en WhatsApp.</span></div> : <>
          <div className="bulk-send-progress"><div><strong>{position + 1} de {recipients.length}</strong><span>{Math.round((position / recipients.length) * 100)}% completado</span></div><progress max={recipients.length} value={position}>{position} de {recipients.length}</progress></div>
          <article className="bulk-send-recipient"><span>Siguiente invitación</span><strong>{current.name}</strong><small>{current.phone} · {current.passes} {Number(current.passes) === 1 ? "pase" : "pases"}</small></article>
        </>}

        {withoutPhone > 0 && <p className="bulk-send-warning">{withoutPhone} {withoutPhone === 1 ? "invitado no tiene" : "invitados no tienen"} teléfono y se omitirá del envío.</p>}

        <footer>
          <button className="button button--light" type="button" onClick={onClose}>{completed ? "Cerrar" : "Cancelar"}</button>
          {!completed && current && <button className="button button--light bulk-skip" type="button" onClick={skipCurrent}><SkipForward size={17} /> Omitir</button>}
          {!completed && current && <button className="button button--gold" type="button" onClick={openCurrent}><MessageCircle size={18} /> Enviar a {current.name}</button>}
        </footer>
      </section>
    </div>
  );
}
