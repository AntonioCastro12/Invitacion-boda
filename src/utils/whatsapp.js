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

export function confirmationMessage(event, guest) {
  return `Hola, somos ${guest.name}.\n\nQueremos confirmar nuestra asistencia a la boda de ${event.name}.\n\nTenemos ${guest.passes} ${guest.passes === 1 ? "lugar asignado" : "lugares asignados"}.\n\nGracias.`;
}
