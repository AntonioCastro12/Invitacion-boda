import { Shirt, Sparkles } from "lucide-react";

export default function DressCode({ config = {} }) {
  return <section className="invitation-section dress-section"><p className="section-intro">Dress code</p><h2>{config.title || "Formal"}</h2><p>Queremos verte increíble.</p><div className="dress-options"><article><Shirt /><strong>Traje formal</strong></article><article><Sparkles /><strong>Vestido largo</strong></article></div><p className="dress-note">Por favor, reserva el color blanco para la novia.</p></section>;
}
