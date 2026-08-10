"use client";

import { motion } from "framer-motion";
import { PersonStanding, Shirt, Sparkles } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function DressCode() {
  return (
    <section className="section dress-section" aria-labelledby="dress-title">
      <SectionHeading eyebrow="Dress code" title="Formal" description="Queremos verte increíble." />
      <motion.div
        className="dress-code"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="dress-code__look">
          <Shirt size={54} strokeWidth={0.9} aria-hidden="true" />
          <span>Traje formal</span>
        </div>
        <Sparkles size={22} strokeWidth={1.1} aria-hidden="true" />
        <div className="dress-code__look dress-code__look--dress">
          <PersonStanding size={54} strokeWidth={0.9} aria-hidden="true" />
          <span>Vestido largo</span>
        </div>
      </motion.div>
      <p className="dress-code__note">Por favor, reserva el color blanco para la novia.</p>
    </section>
  );
}
