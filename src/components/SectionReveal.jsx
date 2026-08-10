"use client";

import { motion, useReducedMotion } from "framer-motion";

const offsets = {
  left: { x: -34, y: 14, scale: 0.99 },
  right: { x: 34, y: 14, scale: 0.99 },
  up: { x: 0, y: 38, scale: 0.99 },
  zoom: { x: 0, y: 20, scale: 0.965 },
};

export default function SectionReveal({ children, direction = "up", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  const offset = offsets[direction] ?? offsets.up;

  return (
    <motion.div
      className={`section-reveal section-reveal--${direction}`}
      initial={reduceMotion ? false : { opacity: 0, filter: "blur(5px)", ...offset }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.08, margin: "0px 0px -7% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
