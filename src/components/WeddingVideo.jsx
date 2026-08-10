"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionHeading from "./SectionHeading";

export default function WeddingVideo({ video }) {
  const videoRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = videoRef.current;
    if (!element || reduceMotion) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.play().catch(() => {
          // Algunos navegadores esperan una interacción antes de reproducir.
        });
      } else {
        element.pause();
      }
    }, { threshold: 0.45 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <section className="section video-section" aria-labelledby="video-title">
      <SectionHeading eyebrow="Nuestra historia" title="Un pedacito de nuestro camino" />
      <motion.div
        className="video-frame"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75 }}
      >
        <video
          ref={videoRef}
          controls
          autoPlay={!reduceMotion}
          muted
          loop
          preload="metadata"
          poster={video.poster}
          playsInline
          aria-label="Video de la historia de los novios; inicia automáticamente sin sonido"
        >
          <source src={video.src} type="video/mp4" />
          Tu navegador no puede reproducir este video.
        </video>
        {/* <span className="video-frame__autoplay">Reproducción automática · sin sonido</span> */}
      </motion.div>
    </section>
  );
}
