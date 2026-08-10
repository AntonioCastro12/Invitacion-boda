"use client";

import { motion } from "framer-motion";
import { ChevronDown, Heart } from "lucide-react";
import BotanicalAccent from "./BotanicalAccent";

const contentVariants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.28, duration: 0.9, staggerChildren: 0.14 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72 } },
};

export default function Hero({ data, opened }) {
  const { couple } = data;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <BotanicalAccent position="top-left" />
      <BotanicalAccent position="bottom-right" />
      <motion.div
        className="hero__content"
        initial={false}
        variants={contentVariants}
        animate={opened ? "visible" : "hidden"}
      >
        <motion.p className="eyebrow" variants={itemVariants}>Nos casamos</motion.p>
        <motion.span variants={itemVariants}>
          <Heart className="hero__heart" size={22} strokeWidth={1.1} aria-hidden="true" />
        </motion.span>
        <motion.h1 id="hero-title" className="hero__names" tabIndex="-1" variants={itemVariants}>
          <motion.span variants={itemVariants}>{couple.bride}</motion.span>
          <motion.b variants={itemVariants}>&amp;</motion.b>
          <motion.span variants={itemVariants}>{couple.groom}</motion.span>
        </motion.h1>
        <motion.div className="hero__date" aria-label="10 de octubre de 2026" variants={itemVariants}>
          <i />
          <time dateTime={data.date}>{data.dateDisplay}</time>
          <i />
        </motion.div>
        <motion.p className="hero__message" variants={itemVariants}>{data.heroMessage}</motion.p>
      </motion.div>
      <motion.a
        href="#cuenta-regresiva"
        className="hero__scroll"
        aria-label="Continuar a la cuenta regresiva"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>Descubre nuestra historia</span>
        <ChevronDown size={18} />
      </motion.a>
    </section>
  );
}
