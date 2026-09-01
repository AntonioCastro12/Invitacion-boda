import { Heart, Leaf, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const ornaments = [
  { Icon: Leaf, className: "elegant-ornament--one", duration: 8 },
  { Icon: Sparkles, className: "elegant-ornament--two", duration: 6.5 },
  { Icon: Heart, className: "elegant-ornament--three", duration: 7.5 },
  { Icon: Leaf, className: "elegant-ornament--four", duration: 9 }
];

export default function ElegantOrnaments() {
  const reduceMotion = useReducedMotion();

  return <div className="elegant-ornaments" aria-hidden="true">{ornaments.map(({ Icon, className, duration }, index) => <motion.span
    className={`elegant-ornament ${className}`}
    key={className}
    initial={reduceMotion ? false : { opacity: 0, scale: .75 }}
    animate={reduceMotion ? { opacity: .32 } : { opacity: [.18, .42, .18], y: [0, -10, 0], rotate: index % 2 ? [0, 7, 0] : [0, -7, 0] }}
    transition={{ duration, delay: index * .55, repeat: Infinity, ease: "easeInOut" }}
  ><Icon /></motion.span>)}</div>;
}
