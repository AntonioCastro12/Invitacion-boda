export default function Footer({ event }) {
  const [year, month, day] = event.event_date.split("-");
  return <footer className="invitation-footer"><p>Con amor</p><strong className="script-title">{event.name}</strong><small>{day} · {month} · {year}</small></footer>;
}
