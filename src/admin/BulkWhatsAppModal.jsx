import { AlertCircle, Bell, CheckCircle2, MessageCircle, SkipForward, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createWhatsAppUrl, invitationMessage, reminderMessage } from "../utils/whatsapp";
import { createInvitationShareUrl } from "../utils/invitationUrl";

const AUDIENCE_OPTIONS = [
  { key: "all", label: "Todos" },
  { key: "confirmed", label: "Confirmados" },
  { key: "pending", label: "Pendientes" },
];

export default function BulkWhatsAppModal({
  event,
  guests,
  onClose,
  initialMode = "invitation",
  rsvpStatusByGuest = {},
}) {
  const baseUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  const [mode, setMode] = useState(initialMode);
  const [audience, setAudience] = useState("all");
  const [customNote, setCustomNote] = useState("");
  const [position, setPosition] = useState(0);
  const [sent, setSent] = useState([]);

  const isReminder = mode === "reminder";

  const scopedGuests = useMemo(() => {
    if (!isReminder || audience === "all") return guests;
    return guests.filter((guest) => (rsvpStatusByGuest[guest.id] || "pending") === audience);
  }, [guests, isReminder, audience, rsvpStatusByGuest]);

  const recipients = useMemo(
    () => scopedGuests.filter((guest) => createWhatsAppUrl(guest.phone, "Prueba")),
    [scopedGuests],
  );
  const withoutPhone = scopedGuests.length - recipients.length;
  const current = recipients[position];
  const completed = recipients.length > 0 && position >= recipients.length;

  function switchMode(nextMode) {
    setMode(nextMode);
    setPosition(0);
    setSent([]);
  }

  function switchAudience(nextAudience) {
    setAudience(nextAudience);
    setPosition(0);
    setSent([]);
  }

  function openCurrent() {
    if (!current) return;
    const invitationUrl = createInvitationShareUrl(event, current, baseUrl);
    const message = isReminder
      ? reminderMessage(event, current, invitationUrl, customNote)
      : invitationMessage(event, current, invitationUrl);
    const whatsappUrl = createWhatsAppUrl(current.phone, message);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setSent((currentSent) => [...currentSent, current.id]);
    setPosition((currentPosition) => currentPosition + 1);
  }

  function skipCurrent() {
    setPosition((currentPosition) => currentPosition + 1);
  }

  return (
    <div className="modal-backdrop modal-backdrop--top" role="presentation" onMouseDown={(eventMouse) => { if (eventMouse.target === eventMouse.currentTarget) onClose(); }}>
      <section className="modal bulk-send-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-send-title">
        <header>
          <div>
            <span className="page-eyebrow">{isReminder ? "Recordatorio por WhatsApp" : "Envío por WhatsApp"}</span>
            <h2 id="bulk-send-title">{isReminder ? "Enviar recordatorio a todos" : "Enviar invitaciones a todos"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </header>

        <div className="bulk-send-tabs" role="tablist" aria-label="Tipo de mensaje">
          <button type="button" role="tab" aria-selected={!isReminder} className={!isReminder ? "active" : ""} onClick={() => switchMode("invitation")}>
            <MessageCircle size={15} /> Invitación
          </button>
          <button type="button" role="tab" aria-selected={isReminder} className={isReminder ? "active" : ""} onClick={() => switchMode("reminder")}>
            <Bell size={15} /> Recordatorio
          </button>
        </div>

        {isReminder && (
          <div className="bulk-send-reminder-controls">
            <div className="bulk-send-filters" aria-label="Destinatarios del recordatorio">
              {AUDIENCE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={audience === option.key ? "active" : ""}
                  onClick={() => switchAudience(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="bulk-send-custom">
              <span>Nota adicional (opcional)</span>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ej. Recuerda llegar 15 minutos antes o confirmar tus lugares."
              />
            </label>
          </div>
        )}

        <div className="bulk-send-note">
          <AlertCircle size={20} />
          <p>
            <strong>WhatsApp requiere confirmar cada envío.</strong>{" "}
            {isReminder
              ? "Abriremos un recordatorio personalizado por familia; revísalo y toca Enviar en WhatsApp. Al regresar, continúa con el siguiente invitado."
              : "Abriremos un mensaje personalizado por familia; revísalo y toca Enviar en WhatsApp. Al regresar, continúa con la siguiente invitación."}
          </p>
        </div>

        {!recipients.length ? (
          <div className="bulk-send-empty">
            <AlertCircle />
            <strong>No hay destinatarios con teléfono</strong>
            <span>
              {isReminder && audience !== "all"
                ? "No hay invitados en este filtro con teléfono registrado. Prueba seleccionando Todos."
                : "Agrega un teléfono a los invitados para poder enviarles mensaje."}
            </span>
          </div>
        ) : completed ? (
          <div className="bulk-send-complete">
            <CheckCircle2 />
            <strong>{isReminder ? "Recordatorios completados" : "Lista de envío completada"}</strong>
            <span>Abriste {sent.length} de {recipients.length} {isReminder ? "recordatorios" : "invitaciones"} en WhatsApp.</span>
          </div>
        ) : (
          <>
            <div className="bulk-send-progress">
              <div><strong>{position + 1} de {recipients.length}</strong><span>{Math.round((position / recipients.length) * 100)}% completado</span></div>
              <progress max={recipients.length} value={position}>{position} de {recipients.length}</progress>
            </div>
            <article className="bulk-send-recipient">
              <span>{isReminder ? "Siguiente recordatorio" : "Siguiente invitación"}</span>
              <strong>{current.name}</strong>
              <small>{current.phone} · {current.passes} {Number(current.passes) === 1 ? "pase" : "pases"}</small>
            </article>
          </>
        )}

        {withoutPhone > 0 && <p className="bulk-send-warning">{withoutPhone} {withoutPhone === 1 ? "invitado no tiene" : "invitados no tienen"} teléfono y se omitirá del envío.</p>}

        <footer>
          <button className="button button--light" type="button" onClick={onClose}>{completed ? "Cerrar" : "Cancelar"}</button>
          {!completed && current && <button className="button button--light bulk-skip" type="button" onClick={skipCurrent}><SkipForward size={17} /> Omitir</button>}
          {!completed && current && (
            <button className="button button--gold" type="button" onClick={openCurrent}>
              {isReminder ? <Bell size={18} /> : <MessageCircle size={18} />} {isReminder ? `Recordar a ${current.name}` : `Enviar a ${current.name}`}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
