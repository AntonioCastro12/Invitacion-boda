export default function FinalMessage({ event }) {
  return <section className="final-message"><p>¡Te esperamos!</p><h2>{event.name}</h2><time dateTime={event.event_date}>10 · 10 · 2026</time><span>Gracias por formar parte de nuestra historia.</span></section>;
}
