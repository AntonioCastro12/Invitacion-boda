export function normalizePhone(phone = "") {
  return String(phone).replace(/\D/g, "");
}

export function createWhatsAppUrl(phone, message) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) return null;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function invitationMessage(event, guest, url) {
  return `Hola ${guest.name} 👋\n\nNos dará mucho gusto que nos acompañen en nuestra ${event.event_type.toLowerCase()}.\n\nHemos preparado esta invitación especialmente para ustedes:\n\n${url}\n\nTenemos ${guest.passes} ${guest.passes === 1 ? "lugar reservado" : "lugares reservados"}.\n\n${event.name} 🤍`;
}

function formatEventDate(dateValue) {
  if (!dateValue) return "";
  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(dateValue);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function reminderMessage(event, guest, url, customNote = "") {
  const eventType = (event.event_type || "celebración").toLowerCase();
  const formattedDate = formatEventDate(event.event_date);
  const datePart = formattedDate ? ` el ${formattedDate}` : "";
  const venuePart = event.ceremony_name ? ` en ${event.ceremony_name}` : "";
  const noteBlock = customNote.trim() ? `\n\n${customNote.trim()}` : "";
  const passesLabel = Number(guest.passes) === 1 ? "1 lugar reservado" : `${guest.passes} lugares reservados`;
  return `Hola ${guest.name} 👋\n\n¡Ya falta muy poco para nuestra ${eventType}! ✨\nTe recordamos que te esperamos${datePart}${venuePart}.${noteBlock}\n\nAquí tienes nuevamente tu invitación y pase (${passesLabel}):\n\n${url}\n\n¡Nos dará mucha alegría verte ahí!\n${event.name} 🤍`;
}

export function confirmationMessage(event, guest) {
  return `Hola, somos ${guest.name}.\n\nQueremos confirmar nuestra asistencia a la boda de ${event.name}.\n\nTenemos ${guest.passes} ${guest.passes === 1 ? "lugar asignado" : "lugares asignados"}.\n\nGracias.`;
}
