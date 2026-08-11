import { Church, GlassWater, Music, UtensilsCrossed } from "lucide-react";

const icons = [Church, GlassWater, UtensilsCrossed, Music];

export default function Itinerary({ items = [] }) {
  return (
    <section className="invitation-section">
      <p className="section-intro">Nuestro día</p><h2>Itinerario</h2>
      <div className="timeline">
        {items.map((item, index) => {
          const Icon = icons[index] || Music;
          return <article key={`${item.time}-${item.title}`}><span className="timeline-icon"><Icon size={20} /></span><div><time>{item.time}</time><h3>{item.title}</h3><p>{item.description}</p></div></article>;
        })}
      </div>
    </section>
  );
}
