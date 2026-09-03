import { Check, Copy, Heart, Share2, TicketCheck, Users } from "lucide-react";
import { useState } from "react";

export default function PersonalizedPass({ guest, event, compact = false }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/evento/${event.slug}/${guest.code}`;
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  async function share() {
    if (navigator.share)
      await navigator.share({
        title: `Invitación de ${event.name}`,
        text: `Invitación para ${guest.name}`,
        url,
      });
    else await copy();
  }
  const pass = <article className={`classic-pass${compact ? " classic-pass--combined" : ""}`}>
        <div className="classic-pass__main">
          <TicketCheck size={26} strokeWidth={1.2} />
          <p>Este pase es para</p>
          <h3 id="guest-name">{guest.name}</h3>
          <Heart size={18} strokeWidth={1.2} />
        </div>
        <div className="classic-pass__stub">
          <Users size={22} strokeWidth={1.2} />
          <span>Tenemos reservados</span>
          <strong>{guest.passes}</strong>
          <b>{guest.passes === 1 ? "lugar" : "lugares"}</b>
        </div>
        {event.features?.individual_qr && (
          <div className="classic-pass__digital">
            <strong>Código individual de invitación</strong>
            <span>
              Utiliza este enlace para volver a tu invitación personalizada.
            </span>
            <code>{guest.code}</code>
            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={copy}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copiado
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copiar enlace
                  </>
                )}
              </button>
              <button
                className="button button--outline"
                type="button"
                onClick={share}
              >
                <Share2 size={14} /> Compartir
              </button>
            </div>
          </div>
        )}
        <p className="classic-pass__note">
          Este pase es personal e intransferible.
        </p>
      </article>;

  if (compact) return pass;

  return (
    <section
      className="invitation-section classic-pass-section"
      aria-labelledby="guest-name"
    >
      <p className="section-intro">Con mucho cariño</p>
      <h2>Tu pase personalizado</h2>
      {pass}
    </section>
  );
}
