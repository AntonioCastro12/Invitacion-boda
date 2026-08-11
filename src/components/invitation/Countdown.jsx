import { useEffect, useMemo, useState } from "react";

function remaining(target) {
  const distance = Math.max(0, target.getTime() - Date.now());
  return {
    días: Math.floor(distance / 86400000),
    horas: Math.floor((distance / 3600000) % 24),
    minutos: Math.floor((distance / 60000) % 60),
    segundos: Math.floor((distance / 1000) % 60)
  };
}

export default function Countdown({ event }) {
  const target = useMemo(() => new Date(`${event.event_date}T${event.event_time || "17:00:00"}`), [event.event_date, event.event_time]);
  const [time, setTime] = useState(() => remaining(target));
  useEffect(() => {
    const timer = window.setInterval(() => setTime(remaining(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  return (
    <section id="cuenta-regresiva" className="invitation-section countdown-section">
      <p className="section-intro">Faltan</p>
      <div className="countdown-grid" aria-live="polite">
        {Object.entries(time).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
      </div>
    </section>
  );
}
