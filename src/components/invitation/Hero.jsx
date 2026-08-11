import { motion } from "framer-motion";
import { ChevronDown, Heart } from "lucide-react";

function splitNames(name = "") {
  const [first = name, second = ""] = name.split(/\s*&\s*/);
  return [first.trim(), second.trim()];
}

export default function Hero({ event, opened }) {
  const [first, second] = splitNames(event.name);
  const date = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${event.event_date}T12:00:00Z`));
  return <section className="classic-hero" aria-labelledby="hero-title"><motion.div className="classic-hero__content" initial={false} animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }} transition={{ delay: .25, duration: .9 }}><p className="eyebrow">Nos casamos</p><Heart className="classic-hero__heart" size={22} strokeWidth={1.1} /><h1 id="hero-title" className="classic-hero__names"><span>{first}</span><b>&amp;</b><span>{second}</span></h1><div className="classic-hero__date"><i /><time dateTime={event.event_date}>{date}</time><i /></div><p className="classic-hero__message">El mejor capítulo de nuestra historia está por comenzar y queremos compartirlo contigo.</p></motion.div><motion.a href="#cuenta-regresiva" className="classic-hero__scroll" animate={{ y: [0, 6, 0] }} transition={{ duration: 2.2, repeat: Infinity }}><span>Descubre nuestra historia</span><ChevronDown size={18} /></motion.a></section>;
}
