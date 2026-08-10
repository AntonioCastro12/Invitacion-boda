"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import BotanicalAccent from "./BotanicalAccent";

const LAST_STAGE = 3;
const elegantEase = [0.22, 1, 0.36, 1];

export default function WelcomeScreen({ messages, couple, dateDisplay, onOpen }) {
  const [stage, setStage] = useState(0);
  const brideInitial = couple.bride.slice(0, 1);
  const groomInitial = couple.groom.slice(0, 1);

  const advance = () => {
    if (stage < LAST_STAGE) setStage((current) => current + 1);
    else onOpen();
  };

  const labels = [
    "Abrir el sobre",
    "Continuar después de abrir el sobre",
    "Continuar al anuncio de la boda",
    "Abrir la invitación completa",
  ];

  const seal = (
    <motion.span
      className="screen-envelope__seal"
      style={{ x: "-50%", y: "-50%" }}
      animate={stage === 0 ? { scale: [1, 1.055, 1], rotate: [0, -1.2, 0] } : undefined}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <span>{brideInitial}</span><i>&amp;</i><span>{groomInitial}</span>
    </motion.span>
  );

  return (
    <motion.div
      className={`welcome welcome--stage-${stage}`}
      role="dialog"
      aria-modal="true"
      aria-label="Presentación de la invitación de boda"
      exit={{ opacity: 0, scale: 1.035, filter: "blur(8px)" }}
      transition={{ duration: 0.9, ease: elegantEase }}
    >
      <button type="button" className="welcome__tap-area" onClick={advance} aria-label={labels[stage]}>
        <span className="welcome__step-count" aria-hidden="true">
          {String(stage + 1).padStart(2, "0")} / 04
        </span>

        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.span
              key="closed-envelope"
              className="welcome__scene welcome__scene--envelope-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75 }}
            >
              <span className="screen-envelope screen-envelope--closed" aria-hidden="true">
                <span className="screen-envelope__paper-grain" />
                <span className="screen-envelope__flap" />
                <span className="screen-envelope__left-fold" />
                <span className="screen-envelope__right-fold" />
                <span className="screen-envelope__recipient">
                  <small>Una invitación especial para ti</small>
                  <strong>{couple.bride} <i>&amp;</i> {couple.groom}</strong>
                </span>
                <span className="screen-envelope__date-mark">{dateDisplay}</span>
                {seal}
              </span>
              <span className="welcome__instruction welcome__instruction--on-envelope">
                Toca el sello para abrir
              </span>
            </motion.span>
          )}

          {stage === 1 && (
            <motion.span
              key="open-envelope"
              className="welcome__scene welcome__scene--envelope-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.7 }}
            >
              <span className="screen-envelope screen-envelope--open" aria-hidden="true">
                <span className="screen-envelope__paper-grain" />
                <span className="screen-envelope__flap" />
                <span className="screen-envelope__letter">
                  <span className="screen-envelope__letter-monogram">
                    {brideInitial} <i>&amp;</i> {groomInitial}
                  </span>
                  <span className="screen-envelope__letter-copy">{messages[0]}</span>
                  <span className="screen-envelope__letter-names">{couple.bride} &amp; {couple.groom}</span>
                  <span className="screen-envelope__letter-line" />
                </span>
                <span className="screen-envelope__left-fold" />
                <span className="screen-envelope__right-fold" />
                <span className="screen-envelope__seal screen-envelope__seal--breaking">
                  <span>{brideInitial}</span><i>&amp;</i><span>{groomInitial}</span>
                </span>
              </span>
              <span className="welcome__instruction welcome__instruction--after-open">Toca para continuar</span>
            </motion.span>
          )}

          {stage === 2 && (
            <motion.span
              key="announcement"
              className="welcome__scene welcome__scene--card"
              initial={{ opacity: 0, y: 32, rotateX: -5, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.02 }}
              transition={{ duration: 0.85, ease: elegantEase }}
            >
              <BotanicalAccent position="top-right" subtle />
              <BotanicalAccent position="bottom-left" subtle />
              <span className="welcome__ornament" aria-hidden="true"><i /></span>
              <motion.span
                className="welcome__announcement"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.75 }}
              >
                {messages[1]}
              </motion.span>
              <motion.span
                className="welcome__names"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.65 }}
              >
                {couple.bride} <i>&amp;</i> {couple.groom}
              </motion.span>
              <Heart className="welcome__heart" size={18} strokeWidth={1.1} aria-hidden="true" />
              <span className="welcome__instruction">Toca para descubrir la fecha</span>
            </motion.span>
          )}

          {stage === 3 && (
            <motion.span
              key="final-intro"
              className="welcome__scene welcome__scene--card"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, ease: elegantEase }}
            >
              <BotanicalAccent position="top-right" subtle />
              <BotanicalAccent position="bottom-left" subtle />
              <motion.span
                className="welcome__monogram"
                initial={{ opacity: 0, rotate: -12, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.75, ease: elegantEase }}
                aria-hidden="true"
              >
                <span>{brideInitial}</span><i>&amp;</i><span>{groomInitial}</span>
              </motion.span>
              <span className="welcome__waiting">{messages[2]}</span>
              <motion.span
                className="welcome__date"
                initial={{ opacity: 0, letterSpacing: "0.22em" }}
                animate={{ opacity: 1, letterSpacing: "0.08em" }}
                transition={{ delay: 0.35, duration: 0.9 }}
              >
                {dateDisplay}
              </motion.span>
              <motion.span
                className="welcome__open-label"
                animate={{ boxShadow: ["0 12px 28px rgba(78,87,66,.18)", "0 17px 38px rgba(78,87,66,.3)", "0 12px 28px rgba(78,87,66,.18)"] }}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                Abrir invitación
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>

        <span className="welcome__progress" aria-hidden="true">
          {Array.from({ length: LAST_STAGE + 1 }, (_, index) => (
            <i key={index} className={index === stage ? "is-active" : ""} />
          ))}
        </span>
      </button>
    </motion.div>
  );
}
