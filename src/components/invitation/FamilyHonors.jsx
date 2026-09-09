import { HeartHandshake } from "lucide-react";

const groups = [
  ["groom_parents", "Padres del novio"],
  ["bride_parents", "Padres de la novia"],
  ["godparents", "Padrinos de velación"],
];

export default function FamilyHonors({ config = {} }) {
  const honors = config.family_honors || {};
  const visibleGroups = groups.filter(([key]) => honors[key]?.length);
  if (!visibleGroups.length) return null;

  return (
    <section className="invitation-section family-honors" aria-labelledby="family-honors-title">
      <HeartHandshake className="section-icon" />
      <p className="section-intro">CON LA BENDICIÓN DE NUESTRAS FAMILIAS</p>
      <h2 id="family-honors-title">Nos acompañan en este día</h2>
      <div className="family-honors__grid">
        {visibleGroups.map(([key, label]) => (
          <article key={key}>
            <span>{label}</span>
            {honors[key].map((name) => <strong key={name}>{name}</strong>)}
          </article>
        ))}
      </div>
    </section>
  );
}
