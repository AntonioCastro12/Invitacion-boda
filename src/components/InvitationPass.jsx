"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Heart, Share2, TicketCheck, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import SectionHeading from "./SectionHeading";
import { weddingData } from "../data/weddingData";

export default function InvitationPass({ guest, token }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const inviteUrl = origin
    ? `${origin}/?invitado=${encodeURIComponent(guest.name)}&lugares=${guest.passes}&token=${encodeURIComponent(token)}`
    : "";
  const checkInUrl = origin ? `${origin}/admin?checkin=${encodeURIComponent(token)}` : "";

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareInvite = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      await navigator.share({ title: `Boda de ${weddingData.couple.bride} y ${weddingData.couple.groom}`, text: `Invitación para ${guest.name}`, url: inviteUrl });
    } else {
      await copyInvite();
    }
  };

  return (
    <section className="section pass-section" aria-labelledby="pass-title">
      <SectionHeading eyebrow="Con mucho cariño" title="Tu pase personalizado" />
      <motion.article
        className="invitation-pass"
        initial={{ opacity: 0, rotate: -1.2, y: 18 }}
        whileInView={{ opacity: 1, rotate: 0, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.75 }}
      >
        <div className="invitation-pass__main">
          <TicketCheck size={24} strokeWidth={1.2} aria-hidden="true" />
          <p>Este pase es para</p>
          <h3 id="pass-title">{guest.name}</h3>
          <Heart size={17} strokeWidth={1.2} aria-hidden="true" />
        </div>
        <div className="invitation-pass__stub">
          <Users size={22} strokeWidth={1.2} aria-hidden="true" />
          <span>Tenemos reservados</span>
          <strong>{guest.passes}</strong>
          <b>{guest.passes === 1 ? "lugar" : "lugares"}</b>
        </div>
        <div className="invitation-pass__digital">
          <div className="invitation-pass__qr">
            {checkInUrl ? <QRCodeSVG value={checkInUrl} size={122} bgColor="#fffdf8" fgColor="#4e5742" level="H" /> : <span className="qr-placeholder" />}
          </div>
          <div className="invitation-pass__digital-copy">
            <strong>Código individual de acceso</strong>
            <span>Preséntalo en la entrada. Solo puede registrarse una vez.</span>
            <code>{token}</code>
            <div>
              <button type="button" className="button button--outline" onClick={copyInvite}>
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar enlace</>}
              </button>
              <button type="button" className="button button--outline" onClick={shareInvite}>
                <Share2 size={14} /> Compartir
              </button>
            </div>
          </div>
        </div>
        <p className="invitation-pass__note">Este pase es personal e intransferible.</p>
      </motion.article>
    </section>
  );
}
