"use client";

import { motion } from "framer-motion";
import { Church, PartyPopper, UtensilsCrossed, Wine } from "lucide-react";
import SectionHeading from "./SectionHeading";

const icons = {
  church: Church,
  toast: Wine,
  dinner: UtensilsCrossed,
  party: PartyPopper,
};

export default function Itinerary({ items }) {
  return (
    <section className="section itinerary-section" aria-labelledby="itinerary-title">
      <SectionHeading
        eyebrow="Acompáñanos"
        title="Un día inolvidable"
        description="Tenemos preparado un día lleno de momentos para compartir contigo."
      />
      <div className="timeline">
        {items.map((item, index) => {
          const Icon = icons[item.icon];
          return (
            <motion.article
              className="timeline__item"
              key={item.time}
              initial={{ opacity: 0, x: index % 2 ? 16 : -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
            >
              <div className="timeline__icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.4} />
              </div>
              <div className="timeline__copy">
                <time>{item.time}</time>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
