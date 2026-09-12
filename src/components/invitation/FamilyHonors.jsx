import { motion, useReducedMotion } from "framer-motion";
import { Gem, HeartHandshake } from "lucide-react";

function FormalFigure({ feminine = false }) {
  return (
    <img
      src={feminine ? "/images/family-lady-silhouette.png" : "/images/family-gentleman-silhouette.png"}
      alt={feminine ? "Silueta de dama con vestido de gala" : "Silueta de caballero con esmoquin"}
      loading="lazy"
      decoding="async"
    />
  );
}

function HonorName({ name, role, feminine = false, delay = 0, reduceMotion = false }) {
  return (
    <motion.div
      className="family-honors__person"
      initial={reduceMotion ? false : { opacity: 0, y: 34, scale: .9 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: .35 }}
      transition={{ duration: .85, delay, type: "spring", bounce: .22 }}
    >
      <span className={`family-honors__gender family-honors__gender--${feminine ? "woman" : "man"}`}>
        <FormalFigure feminine={feminine} />
      </span>
      <motion.span initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .6, delay: delay + .35 }}>
        <small>{role}</small>
        <strong>{name}</strong>
      </motion.span>
    </motion.div>
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
      <motion.div className="family-honors__crest" aria-hidden="true" initial={reduceMotion ? false : { opacity: 0, scale: .55 }} whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: .9, type: "spring" }}>
        <i />
        <span>E</span>
        <HeartHandshake />
        <span>D</span>
        <i />
      </motion.div>
      <motion.p className="section-intro" initial={reduceMotion ? false : { opacity: 0, letterSpacing: ".4em" }} whileInView={reduceMotion ? undefined : { opacity: 1, letterSpacing: ".14em" }} viewport={{ once: true }} transition={{ duration: 1.1 }}>CON LA BENDICIÓN DE NUESTRAS FAMILIAS</motion.p>
      <motion.h2 id="family-honors-title" initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .85, delay: .12 }}>Nuestras raíces</motion.h2>
      <motion.p className="family-honors__lead" initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .8, delay: .24 }}>Con amor y gratitud, honramos a quienes nos dieron la vida y hoy bendicen nuestro camino.</motion.p>
      <div className="family-honors__families">
        {groomParents.length > 0 && <motion.article className="family-honors__family-card" initial={reduceMotion ? false : { opacity: 0, x: -52, rotate: -1.5 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .9, type: "spring", bounce: .14 }}>
          <header><span>Familia del novio</span><h3>Padres de Eduardo</h3></header>
          <div>
            {groomParents[0] && <HonorName name={groomParents[0]} role="Padre" reduceMotion={reduceMotion} delay={.12} />}
            {groomParents[1] && <HonorName name={groomParents[1]} role="Madre" feminine reduceMotion={reduceMotion} delay={.27} />}
          </div>
        </motion.article>}
        <motion.div className="family-honors__union" aria-hidden="true" animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }} transition={reduceMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}><i /><HeartHandshake /><i /></motion.div>
        {brideParents.length > 0 && <motion.article className="family-honors__family-card" initial={reduceMotion ? false : { opacity: 0, x: 52, rotate: 1.5 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .9, type: "spring", bounce: .14 }}>
          <header><span>Familia de la novia</span><h3>Padres de Dulce</h3></header>
          <div>
            {brideParents[0] && <HonorName name={brideParents[0]} role="Padre" reduceMotion={reduceMotion} delay={.12} />}
            {brideParents[1] && <HonorName name={brideParents[1]} role="Madre" feminine reduceMotion={reduceMotion} delay={.27} />}
          </div>
        </motion.article>}
      </div>
      {godparents.length > 0 && <motion.article className="family-honors__godparents" initial={reduceMotion ? false : { opacity: 0, y: 58, scale: .94 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: .2 }} transition={{ duration: 1, type: "spring", bounce: .16 }}>
        <Gem aria-hidden="true" />
        <header><span>Nuestro vínculo espiritual</span><h3>Padrinos de velación</h3></header>
        <div>
          {godparents[0] && <HonorName name={godparents[0]} role="Padrino" reduceMotion={reduceMotion} delay={.12} />}
          {godparents[1] && <HonorName name={godparents[1]} role="Madrina" feminine reduceMotion={reduceMotion} delay={.27} />}
        </div>
      </motion.article>}
      <motion.div className="family-honors__closing" aria-hidden="true" initial={reduceMotion ? false : { opacity: 0, scaleX: .2 }} whileInView={reduceMotion ? undefined : { opacity: 1, scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.15 }}><i /><span>❦</span><i /></motion.div>
    </section>
  );
}
