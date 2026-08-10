"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function FinalMessage({ data }) {
  return (
    <section className="final-message" aria-labelledby="final-title">
      <img src="/images/pareja-2.jpg" alt="Dulce y Eduardo celebrando su historia" loading="lazy" />
      <div className="final-message__overlay" />
      <motion.div
        className="final-message__content"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.85 }}
      >
        <p>¡Te esperamos!</p>
        <Heart size={20} strokeWidth={1.1} fill="currentColor" aria-hidden="true" />
        <h2 id="final-title">{data.couple.bride} &amp; {data.couple.groom}</h2>
        <time dateTime={data.date}>{data.dateDisplay}</time>
        <span>Gracias por formar parte de nuestra historia.</span>
      </motion.div>
    </section>
  );
}
