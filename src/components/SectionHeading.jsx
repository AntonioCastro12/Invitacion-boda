"use client";

import { motion } from "framer-motion";

export default function SectionHeading({ eyebrow, title, description, light = false }) {
  return (
    <motion.header
      className={`section-heading${light ? " section-heading--light" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <span className="gold-flourish" aria-hidden="true">
        <i />
      </span>
      {description && <p>{description}</p>}
    </motion.header>
  );
}
