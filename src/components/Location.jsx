"use client";

import { motion } from "framer-motion";
import { Clock3, Map, MapPin, Navigation } from "lucide-react";

export default function Location({ place, index }) {
  const query = `${place.lat},${place.lng}`;
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(query)}&navigate=yes`;

  return (
    <motion.article
      className="location-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
    >
      <div className="location-card__image">
        <img src={place.image} alt={`Vista representativa de ${place.name}`} loading="lazy" />
        <span>{place.label}</span>
      </div>
      <div className="location-card__content">
        <MapPin size={22} strokeWidth={1.25} aria-hidden="true" />
        <h3>{place.name}</h3>
        <p>{place.address}</p>
        <p className="location-card__time">
          <Clock3 size={15} /> {place.time}
        </p>
        <div className="location-card__actions">
          <a className="button button--outline" href={googleUrl} target="_blank" rel="noreferrer">
            <Map size={16} /> Google Maps
          </a>
          <a className="button button--outline" href={wazeUrl} target="_blank" rel="noreferrer">
            <Navigation size={16} /> Waze
          </a>
        </div>
      </div>
    </motion.article>
  );
}
