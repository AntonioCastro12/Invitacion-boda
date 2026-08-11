import { ChevronDown, Gift, Landmark } from "lucide-react";
import { useState } from "react";

export default function GiftRegistry({ registries = [], bank = {} }) {
  const [open, setOpen] = useState(false);
  return <section className="invitation-section gifts-section"><Gift className="section-icon" /><p className="section-intro">Tu presencia es nuestro regalo</p><h2>Mesa de regalos</h2><p>El mejor regalo es compartir este día contigo. Si deseas tener un detalle con nosotros…</p><div className="gift-links">{registries.map((registry) => <a className="gift-store" key={registry.name} href={registry.url} target="_blank" rel="noreferrer"><Gift size={18} /> {registry.name}</a>)}</div><button className="bank-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open}><span><Landmark size={19} /> Transferencia bancaria</span><ChevronDown className={open ? "is-open" : ""} /></button>{open && <div className="bank-details"><span>Banco</span><strong>{bank.bank || "Banco Nacional"}</strong><span>Titular</span><strong>{bank.holder || "Dulce & Eduardo"}</strong><span>CLABE</span><code>{bank.clabe || "000 000 0000000000 0"}</code></div>}</section>;
}
