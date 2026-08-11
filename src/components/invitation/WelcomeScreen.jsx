import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

const LAST_STAGE = 3;
const elegantEase = [0.22, 1, 0.36, 1];

function coupleNames(name = "") {
  const [first = "RCM", second = "Invitaciones"] = name.split(/\s*&\s*/);
  return { first: first.trim(), second: second.trim() };
}

function dateLabel(date) {
  const [year, month, day] = date.split("-");
  return `${day} · ${month} · ${year}`;
}

export default function WelcomeScreen({ event, onOpen }) {
  const [stage, setStage] = useState(0);
  const reduceMotion = useReducedMotion();
  const names = coupleNames(event.name);
  const initials = [names.first.charAt(0), names.second.charAt(0)];
  const displayDate = dateLabel(event.event_date);
  const advance = () => stage < LAST_STAGE ? setStage((current) => current + 1) : onOpen();
  const labels = ["Abrir el sobre", "Continuar después de abrir el sobre", "Continuar al anuncio de la boda", "Abrir la invitación completa"];

  return (
    <motion.div className={`welcome welcome--stage-${stage}`} role="dialog" aria-modal="true" aria-label="Presentación de la invitación" exit={reduceMotion ? undefined : { opacity: 0, scale: 1.035, filter: "blur(8px)" }} transition={{ duration: .9, ease: elegantEase }}>
      <button type="button" className="welcome__tap-area" onClick={advance} aria-label={labels[stage]}>
        <span className="welcome__step-count" aria-hidden="true">{String(stage + 1).padStart(2, "0")} / 04</span>
        <AnimatePresence mode="wait">
          {stage === 0 && <motion.span key="closed" className="welcome__scene welcome__scene--envelope-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="screen-envelope screen-envelope--closed" aria-hidden="true"><span className="screen-envelope__paper-grain" /><span className="screen-envelope__flap" /><span className="screen-envelope__left-fold" /><span className="screen-envelope__right-fold" /><span className="screen-envelope__recipient"><small>Una invitación especial para ti</small><strong>{names.first} <i>&amp;</i> {names.second}</strong></span><span className="screen-envelope__date-mark">{displayDate}</span><motion.span className="screen-envelope__seal" style={{ x: "-50%", y: "-50%" }} animate={reduceMotion ? undefined : { scale: [1, 1.055, 1], rotate: [0, -1.2, 0] }} transition={{ duration: 2.5, repeat: Infinity }}><span>{initials[0]}</span><i>&amp;</i><span>{initials[1]}</span></motion.span></span>
            <span className="welcome__instruction welcome__instruction--on-envelope">Toca el sello para abrir</span>
          </motion.span>}
          {stage === 1 && <motion.span key="open" className="welcome__scene welcome__scene--envelope-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: .985 }}>
            <span className="screen-envelope screen-envelope--open" aria-hidden="true"><span className="screen-envelope__paper-grain" /><span className="screen-envelope__flap" /><span className="screen-envelope__letter"><span className="screen-envelope__letter-monogram">{initials[0]} <i>&amp;</i> {initials[1]}</span><span className="screen-envelope__letter-copy">Tenemos algo especial que contarte…</span><span className="screen-envelope__letter-names">{event.name}</span><span className="screen-envelope__letter-line" /></span><span className="screen-envelope__left-fold" /><span className="screen-envelope__right-fold" /><span className="screen-envelope__seal screen-envelope__seal--breaking"><span>{initials[0]}</span><i>&amp;</i><span>{initials[1]}</span></span></span>
            <span className="welcome__instruction welcome__instruction--after-open">Toca para continuar</span>
          </motion.span>}
          {stage === 2 && <motion.span key="announcement" className="welcome__scene welcome__scene--card" initial={{ opacity: 0, y: 32, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: .85, ease: elegantEase }}><span className="welcome__ornament"><i /></span><span className="welcome__announcement">¡Nos casamos!</span><span className="welcome__names">{names.first} <i>&amp;</i> {names.second}</span><Heart className="welcome__heart" size={18} strokeWidth={1.1} /><span className="welcome__instruction">Toca para descubrir la fecha</span></motion.span>}
          {stage === 3 && <motion.span key="final" className="welcome__scene welcome__scene--card" initial={{ opacity: 0, y: 28, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .85, ease: elegantEase }}><motion.span className="welcome__monogram" initial={{ opacity: 0, rotate: -12 }} animate={{ opacity: 1, rotate: 0 }}><span>{initials[0]}</span><i>&amp;</i><span>{initials[1]}</span></motion.span><span className="welcome__waiting">Te esperamos</span><span className="welcome__date">{displayDate}</span><motion.span className="welcome__open-label" animate={reduceMotion ? undefined : { boxShadow: ["0 12px 28px rgba(78,87,66,.18)", "0 17px 38px rgba(78,87,66,.3)", "0 12px 28px rgba(78,87,66,.18)"] }} transition={{ duration: 2.6, repeat: Infinity }}>Abrir invitación</motion.span></motion.span>}
        </AnimatePresence>
        <span className="welcome__progress" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <i key={index} className={index === stage ? "is-active" : ""} />)}</span>
      </button>
    </motion.div>
  );
}
