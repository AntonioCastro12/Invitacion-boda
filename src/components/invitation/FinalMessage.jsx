export default function FinalMessage({ event }) {
  const [year, month, day] = event.event_date.split("-");
  return <section className="final-message"><p>¡Te esperamos!</p><h2>{event.name}</h2><time dateTime={event.event_date}>{day} · {month} · {year}</time><span>Gracias por formar parte de nuestra historia.</span></section>;
}
