import { motion, useReducedMotion } from "framer-motion";

export default function SectionReveal({ children, delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="section-reveal"
      initial={reduceMotion ? false : { opacity: 0, y: 46, scale: .985, filter: "blur(7px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -32px" }}
      transition={{ duration: 0.88, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: reduceMotion ? "auto" : "transform, opacity, filter" }}
    >
      {children}
    </motion.div>
  );
}
