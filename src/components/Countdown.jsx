"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import SectionHeading from "./SectionHeading";

function getTimeLeft(date) {
  const distance = Math.max(0, new Date(date).getTime() - Date.now());
  return {
    distance,
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

export default function Countdown({ date }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const updateTime = () => setTime(getTimeLeft(date));
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, [date]);

  const units = [
    ["days", "Días"],
    ["hours", "Horas"],
    ["minutes", "Min."],
    ["seconds", "Seg."],
  ];

  return (
    <section id="cuenta-regresiva" className="section countdown-section" aria-labelledby="countdown-title">
      <SectionHeading eyebrow="Guarda la fecha" title="Faltan…" />
      {time?.distance === 0 ? (
        <motion.p className="countdown__today" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          ¡Llegó nuestro gran día! <Heart size={20} fill="currentColor" />
        </motion.p>
      ) : (
        <motion.div
          className="countdown"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          aria-live="polite"
          aria-busy={!time}
        >
          {units.map(([key, label], index) => (
            <div className="countdown__unit" key={key}>
              <strong>{time ? String(time[key]).padStart(2, "0") : "--"}</strong>
              <span>{label}</span>
              {index < units.length - 1 && <i aria-hidden="true">·</i>}
            </div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
