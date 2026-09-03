import { Church, DoorOpen, GlassWater, MoonStar, Music2, PartyPopper, UtensilsCrossed } from "lucide-react";

function iconFor(title = "") {
  const normalized = title.toLocaleLowerCase("es-MX");
  if (normalized.includes("misa") || normalized.includes("ceremonia")) return Church;
  if (normalized.includes("recepción")) return GlassWater;
  if (normalized.includes("entrada")) return DoorOpen;
  if (normalized.includes("comida") || normalized.includes("cena")) return UtensilsCrossed;
  if (normalized.includes("vals")) return Music2;
  if (normalized.includes("fin")) return MoonStar;
  if (normalized.includes("baile") || normalized.includes("fiesta")) return PartyPopper;
  return PartyPopper;
}

export default function Itinerary({ items = [] }) {
  return (
    <section className="invitation-section">
      <p className="section-intro">Nuestro día</p>
      <h2>Itinerario</h2>
      <div className="timeline">
        {items.map((item) => {
          const Icon = iconFor(item.title);
          return (
            <article key={`${item.time}-${item.title}`}>
              <span className="timeline-icon">
                <Icon size={20} />
              </span>
              <div>
                <time>{item.time}</time>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
