import { motion, useReducedMotion } from "framer-motion";

const icons = {
  groom: "/images/honors-tuxedo.jpg",
  bride: "/images/honors-dress.jpg",
  godparents: "/images/honors-couple.jpg",
};

function HonorGroup({ icon, eyebrow, title, names, delay, reduceMotion }) {
  if (!names.length) return null;

  return (
    <motion.article
      className="family-honors__group"
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="family-honors__icon" aria-hidden="true">
        <img src={icon} alt="" loading="lazy" decoding="async" />
      </span>
      {eyebrow && <p>{eyebrow}</p>}
      <h3>{title}</h3>
      <div className="family-honors__names">
        {names.map((name, index) => (
          <motion.strong
            key={name}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay + 0.18 + index * 0.12 }}
          >
            {name}
          </motion.strong>
        ))}
      </div>
    </motion.article>
  );
}

export default function FamilyHonors({ config = {} }) {
  const reduceMotion = useReducedMotion();
  const honors = config.family_honors || {};
  const groomParents = honors.groom_parents || [];
  const brideParents = honors.bride_parents || [];
  const godparents = honors.godparents || [];
  if (!groomParents.length && !brideParents.length && !godparents.length) return null;

  return (
    <section className="invitation-section family-honors" aria-labelledby="family-honors-title">
      <motion.header
        className="family-honors__heading"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        <img src="/images/honors-bouquet.jpg" alt="" aria-hidden="true" />
        <p className="section-intro">CON LA BENDICIÓN DE NUESTRAS FAMILIAS</p>
        <h2 id="family-honors-title">Nuestras raíces</h2>
        <span>Con amor y gratitud, honramos a quienes nos acompañan y bendicen nuestro camino.</span>
      </motion.header>

      <div className="family-honors__list">
        <HonorGroup icon={icons.groom} title="Padres del novio" names={groomParents} delay={0.08} reduceMotion={reduceMotion} />
        <HonorGroup icon={icons.bride} title="Padres de la novia" names={brideParents} delay={0.16} reduceMotion={reduceMotion} />
        <HonorGroup icon={icons.godparents} eyebrow="Nuestro vínculo espiritual" title="Padrinos de velación" names={godparents} delay={0.24} reduceMotion={reduceMotion} />
      </div>

      <motion.footer
        className="family-honors__footer"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75 }}
        aria-hidden="true"
      >
        <i />
        <img src="/images/honors-bouquet.jpg" alt="" loading="lazy" decoding="async" />
        <i />
      </motion.footer>
    </section>
  );
}
