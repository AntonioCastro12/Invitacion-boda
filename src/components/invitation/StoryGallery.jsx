import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const fallbackPhotos = ["/images/pareja-1.jpg", "/images/pareja-2.jpg", "/images/pareja-3.jpg", "/images/pareja-4.jpg", "/images/pareja-5.jpg"];

export default function StoryGallery({ photos = fallbackPhotos }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const items = photos?.length ? photos : fallbackPhotos;

  function move(step) {
    setDirection(step);
    setActive((current) => (current + step + items.length) % items.length);
  }

  useEffect(() => {
    if (paused || reduceMotion || items.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActive((current) => (current + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, items.length]);

  return (
    <section className="invitation-section story-section">
      <p className="section-intro">Cada instante nos trajo hasta aquí</p>
      <h2>Nuestra historia</h2>
      <p>Cinco recuerdos, una misma promesa y toda una vida por escribir.</p>
      <div className="story-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className="story-carousel__viewport" aria-live="polite">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.figure
              key={`${items[active]}-${active}`}
              custom={direction}
              initial={reduceMotion ? false : { opacity: 0, x: direction > 0 ? 70 : -70, scale: .97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: direction > 0 ? -70 : 70, scale: .97 }}
              transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}
              drag={items.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={.18}
              onDragEnd={(_event, info) => {
                if (info.offset.x < -45) move(1);
                if (info.offset.x > 45) move(-1);
              }}
            >
              <img src={items[active]} alt={`Recuerdo de los novios ${active + 1} de ${items.length}`} draggable="false" />
              <span>{String(active + 1).padStart(2, "0")}</span>
            </motion.figure>
          </AnimatePresence>
        </div>
        {items.length > 1 && <>
          <button className="story-carousel__arrow story-carousel__arrow--prev" type="button" onClick={() => move(-1)} aria-label="Fotografía anterior"><ChevronLeft /></button>
          <button className="story-carousel__arrow story-carousel__arrow--next" type="button" onClick={() => move(1)} aria-label="Fotografía siguiente"><ChevronRight /></button>
          <div className="story-carousel__dots" aria-label="Seleccionar fotografía">{items.map((photo, index) => <button key={`${photo}-${index}`} className={index === active ? "is-active" : ""} type="button" onClick={() => { setDirection(index > active ? 1 : -1); setActive(index); }} aria-label={`Ver fotografía ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}</div>
        </>}
      </div>
      <Camera className="story-camera" size={18} />
    </section>
  );
}
