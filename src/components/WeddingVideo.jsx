"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

export default function WeddingVideo({ video }) {
  return (
    <section className="section video-section" aria-labelledby="video-title">
      <SectionHeading eyebrow="Presiona play" title="Un pedacito de nuestra historia" />
      <motion.div
        className="video-frame"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75 }}
      >
        <video controls preload="metadata" poster={video.poster} playsInline>
          <source src={video.src} type="video/mp4" />
          Tu navegador no puede reproducir este video.
        </video>
      </motion.div>
    </section>
  );
}
