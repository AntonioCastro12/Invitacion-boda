function compactDate(value) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function createCalendarUrl(event) {
  const start = new Date(`${event.event_date}T${event.event_time || "17:00:00"}`);
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${compactDate(start)}/${compactDate(end)}`,
    details: `Acompáñanos a celebrar nuestra ${event.event_type.toLowerCase()}.`,
    location: `${event.reception_name}, ${event.reception_address}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
