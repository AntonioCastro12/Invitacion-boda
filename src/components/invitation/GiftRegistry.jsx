import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Gift,
  Landmark,
} from "lucide-react";
import { useState } from "react";

export default function GiftRegistry({ registries = [], bank = {} }) {
  const [openRegistry, setOpenRegistry] = useState("");
  const [bankOpen, setBankOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const hasBankDetails = Boolean(bank?.clabe);

  async function copyCode(registry) {
    await navigator.clipboard.writeText(registry.code);
    setCopied(registry.name);
    window.setTimeout(() => setCopied(""), 2200);
  }

  return (
    <section className="invitation-section gifts-section">
      <Gift className="section-icon" />
      <p className="section-intro">Tu presencia es nuestro regalo</p>
      <h2>Mesa de regalos</h2>
      <p>
        El mejor regalo es compartir este día contigo. Si deseas tener un
        detalle con nosotros, consulta las siguientes opciones.
      </p>

      <div className="gift-registry-grid">
        {registries.map((registry) => {
          const isOpen = openRegistry === registry.name;
          const registryClass = registry.name.toLowerCase().replaceAll(" ", "-");

          return (
            <motion.article
              className={`gift-registry-card gift-registry-card--${registryClass}`}
              key={registry.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="gift-registry-card__brand">
                <span className="gift-registry-card__icon">
                  <Gift size={21} />
                </span>
                <span>
                  <small>Mesa de regalos</small>
                  <strong>{registry.name}</strong>
                </span>
              </div>

              {registry.url && (
                <a
                  className="gift-registry-card__link"
                  href={registry.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir mesa de regalos <ExternalLink size={17} />
                </a>
              )}

              {registry.code && registry.code !== "POR CONFIRMAR" && (
                <>
                  <button
                    className="gift-code-toggle"
                    type="button"
                    onClick={() => setOpenRegistry(isOpen ? "" : registry.name)}
                    aria-expanded={isOpen}
                    aria-controls={`gift-code-${registryClass}`}
                  >
                    <span>
                      <small>¿Te piden el número?</small>
                      Ver número del evento
                    </span>
                    <ChevronDown className={isOpen ? "is-open" : ""} size={19} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="gift-code-panel"
                        id={`gift-code-${registryClass}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                      >
                        <div className="gift-code-panel__inner">
                          <small>Número del evento</small>
                          <strong>{registry.code}</strong>
                          <button
                            className="gift-code-copy"
                            type="button"
                            onClick={() => copyCode(registry)}
                          >
                            {copied === registry.name ? (
                              <>
                                <Check size={16} /> Número copiado
                              </>
                            ) : (
                              <>
                                <Copy size={16} /> Copiar número
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.article>
          );
        })}
      </div>

      {hasBankDetails && (
        <>
          <button
            className="bank-toggle"
            type="button"
            onClick={() => setBankOpen(!bankOpen)}
            aria-expanded={bankOpen}
          >
            <span>
              <Landmark size={19} /> Transferencia bancaria
            </span>
            <ChevronDown className={bankOpen ? "is-open" : ""} />
          </button>
          {bankOpen && (
            <div className="bank-details">
              <span>Banco</span>
              <strong>{bank.bank}</strong>
              <span>Titular</span>
              <strong>{bank.holder}</strong>
              <span>CLABE</span>
              <code>{bank.clabe}</code>
            </div>
          )}
        </>
      )}
    </section>
  );
}
