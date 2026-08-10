"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, ExternalLink, Gift } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function Gifts({ gifts, bank }) {
  const [showBank, setShowBank] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyClabe = async () => {
    try {
      await navigator.clipboard.writeText(bank.clabe.replace(/\s/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="section gifts-section" aria-labelledby="gifts-title">
      <SectionHeading
        eyebrow="Tu presencia es nuestro regalo"
        title="Mesa de regalos"
        description="El mejor regalo es compartir este día contigo. Si deseas tener un detalle con nosotros…"
      />
      <motion.div
        className="gift-actions"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {gifts.map((gift) => (
          <a className="gift-button" href={gift.href} target="_blank" rel="noreferrer" key={gift.label}>
            <Gift size={19} strokeWidth={1.2} />
            <span>{gift.label}</span>
            <ExternalLink size={14} />
          </a>
        ))}
        <button type="button" className="gift-button" onClick={() => setShowBank((value) => !value)} aria-expanded={showBank}>
          <Building2 size={19} strokeWidth={1.2} />
          <span>Transferencia bancaria</span>
          <b aria-hidden="true">+</b>
        </button>
      </motion.div>
      <AnimatePresence>
        {showBank && (
          <motion.div
            className="bank-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p>{bank.bank}</p>
            <span>{bank.holder}</span>
            <strong>{bank.clabe}</strong>
            <button type="button" onClick={copyClabe}>{copied ? <><Check size={14} /> Copiada</> : "Copiar CLABE"}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
