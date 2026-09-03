import { Check, ChevronDown, Copy, Gift, Landmark } from "lucide-react";
import { useState } from "react";

export default function GiftRegistry({ registries = [], bank = {} }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const hasBankDetails = Boolean(bank?.clabe);

  async function copyCode(registry) {
    await navigator.clipboard.writeText(registry.code);
    setCopied(registry.name);
    window.setTimeout(() => setCopied(""), 2200);
  }

  return <section className="invitation-section gifts-section"><Gift className="section-icon" /><p className="section-intro">Tu presencia es nuestro regalo</p><h2>Mesa de regalos</h2><p>El mejor regalo es compartir este día contigo. Si deseas tener un detalle con nosotros, utiliza el siguiente código.</p><div className="gift-links">{registries.map((registry) => registry.code ? <article className="gift-code-card" key={registry.name}><Gift size={20} /><span>{registry.name}</span><strong>{registry.code}</strong>{registry.code !== "POR CONFIRMAR" && <button className="button button--outline" type="button" onClick={() => copyCode(registry)}>{copied === registry.name ? <><Check size={16} /> Código copiado</> : <><Copy size={16} /> Copiar código</>}</button>}</article> : <a className="gift-store" key={registry.name} href={registry.url} target="_blank" rel="noreferrer"><Gift size={18} /> {registry.name}</a>)}</div>{hasBankDetails && <><button className="bank-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open}><span><Landmark size={19} /> Transferencia bancaria</span><ChevronDown className={open ? "is-open" : ""} /></button>{open && <div className="bank-details"><span>Banco</span><strong>{bank.bank}</strong><span>Titular</span><strong>{bank.holder}</strong><span>CLABE</span><code>{bank.clabe}</code></div>}</>}</section>;
}
