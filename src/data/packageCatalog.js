export const featureCatalog = [
  { key: "responsive", label: "Diseño responsive" },
  { key: "single_page", label: "Invitación de una página" },
  { key: "main_photo", label: "Fotografía principal" },
  { key: "event_details", label: "Fecha, hora y lugar" },
  { key: "google_maps", label: "Google Maps" },
  { key: "whatsapp_button", label: "Botón de WhatsApp" },
  { key: "animated_cover", label: "Portada con botón Abrir" },
  { key: "music", label: "Música de fondo" },
  { key: "countdown", label: "Cuenta regresiva" },
  { key: "premium_gallery", label: "Galería premium" },
  { key: "dress_code", label: "Código de vestimenta" },
  { key: "final_message", label: "Mensaje final personalizado" },
  { key: "soft_animations", label: "Animaciones suaves" },
  { key: "itinerary", label: "Itinerario" },
  { key: "maps_waze", label: "Google Maps + Waze" },
  { key: "gift_registry", label: "Mesa de regalos" },
  { key: "add_calendar", label: "Agregar al calendario" },
  { key: "whatsapp_rsvp", label: "Confirmación por WhatsApp" },
  { key: "form_rsvp", label: "Confirmación mediante formulario" },
  { key: "embedded_video", label: "Video dentro de la invitación" },
  { key: "personalized_passes", label: "Pases personalizados" },
  { key: "extra_sections", label: "Secciones adicionales" },
  { key: "personalized_url", label: "URL o código personalizado" },
  { key: "guest_database", label: "Base de datos de invitados" },
  { key: "database_rsvp", label: "Confirmaciones guardadas en el panel" },
  { key: "confirmation_statuses", label: "Estados de confirmación" },
  { key: "pass_count", label: "Conteo de pases y asistentes" },
  { key: "confirmation_panel", label: "Panel de confirmaciones" },
  { key: "individual_qr", label: "QR individual" },
  { key: "admin_panel", label: "Panel administrativo" },
  { key: "collaborative_album", label: "Álbum colaborativo" },
  { key: "qr_scanner", label: "Escáner QR desde celular" },
  { key: "access_control", label: "Control de acceso" },
  { key: "entry_log", label: "Registro de hora de entrada" },
  { key: "used_pass_control", label: "Control de pases utilizados" },
  { key: "duplicate_qr_prevention", label: "Prevención de QR duplicados" },
  { key: "statistics", label: "Estadísticas avanzadas" }
];

const allOff = Object.fromEntries(featureCatalog.map(({ key }) => [key, false]));
const enabled = (...keys) => ({ ...allOff, ...Object.fromEntries(keys.map((key) => [key, true])) });

export const packages = [
  {
    key: "esencial-250", name: "Esencial", price: 250, galleryLimit: 1,
    includes: ["Invitación digital de una sola página", "Nombres y fecha", "Fotografía principal", "Fecha, hora y lugar", "Botón de Google Maps", "Botón de WhatsApp", "Diseño responsive para celular"],
    recommendedFor: "Eventos pequeños o clientes que buscan una opción económica.",
    features: enabled("responsive", "single_page", "main_photo", "event_details", "google_maps", "whatsapp_button", "whatsapp_rsvp")
  },
  {
    key: "musical-500", name: "Clásica", price: 500, galleryLimit: 5,
    includes: ["Todo lo del paquete Esencial", "Portada con botón Abrir invitación", "Música de fondo", "Cuenta regresiva", "Galería de hasta 5 fotografías", "Código de vestimenta", "Mensaje final personalizado"],
    recommendedFor: "Una invitación emotiva con las funciones más solicitadas.",
    features: enabled("responsive", "single_page", "main_photo", "event_details", "google_maps", "whatsapp_button", "animated_cover", "music", "countdown", "dress_code", "final_message")
  },
  {
    key: "elegante-900", name: "Elegante", price: 900, galleryLimit: 20,
    includes: ["Todo lo del paquete Clásica", "Animaciones suaves", "Galería premium", "Itinerario", "Google Maps + Waze", "Mesa de regalos", "Botón Agregar al calendario", "Confirmación por WhatsApp"],
    recommendedFor: "Bodas, XV años y eventos que buscan una experiencia visual completa.",
    features: enabled("responsive", "single_page", "main_photo", "event_details", "google_maps", "whatsapp_button", "animated_cover", "music", "countdown", "dress_code", "final_message", "soft_animations", "premium_gallery", "itinerary", "maps_waze", "gift_registry", "add_calendar", "whatsapp_rsvp")
  },
  {
    key: "premium-1500", name: "Premium", price: 1500, galleryLimit: 40,
    includes: ["Todo lo del paquete Elegante", "Formulario para confirmar asistencia", "Video dentro de la invitación", "Pase personalizado con nombre/familia", "Número de lugares asignados", "Mayor personalización visual", "Secciones adicionales según el evento"],
    recommendedFor: "Clientes que desean personalización y mejor control de confirmaciones.",
    features: enabled("responsive", "single_page", "main_photo", "event_details", "google_maps", "whatsapp_button", "animated_cover", "music", "countdown", "dress_code", "final_message", "soft_animations", "premium_gallery", "itinerary", "maps_waze", "gift_registry", "add_calendar", "form_rsvp", "embedded_video", "personalized_passes", "extra_sections")
  },
  {
    key: "premium-plus-2500", name: "Premium Plus", price: 2500, galleryLimit: 80,
    includes: ["Todo lo del paquete Premium", "URL o código personalizado por invitado/familia", "Base de datos de invitados", "Estados: confirmado, pendiente y no asistirá", "Conteo de pases y asistentes", "Panel básico de confirmaciones", "QR individual por invitado o familia"],
    recommendedFor: "Eventos medianos que requieren organizar invitados y pases.",
    features: enabled("responsive", "single_page", "main_photo", "event_details", "google_maps", "whatsapp_button", "animated_cover", "music", "countdown", "dress_code", "final_message", "soft_animations", "premium_gallery", "itinerary", "maps_waze", "gift_registry", "add_calendar", "embedded_video", "personalized_passes", "extra_sections", "personalized_url", "guest_database", "database_rsvp", "confirmation_statuses", "pass_count", "confirmation_panel", "individual_qr", "admin_panel", "statistics")
  },
  {
    key: "vip-5000", name: "VIP", price: 5000, galleryLimit: 200,
    includes: ["Todo lo del paquete Premium Plus", "Panel administrativo completo", "Confirmaciones guardadas y administradas en el panel", "QR único con validación", "Escáner de QR desde celular", "Control de acceso al evento", "Registro de hora de entrada", "Control de pases utilizados", "Prevención de QR duplicados", "Estadísticas de confirmados, pendientes y accesos", "Álbum colaborativo mediante QR o enlace", "Experiencia y diseño VIP personalizados"],
    recommendedFor: "La solución completa: invitación + gestión de invitados + validación y control de acceso.",
    features: Object.fromEntries(featureCatalog.map(({ key }) => [key, true]))
  }
];

export const packageComparison = [
  { label: "Responsive", values: ["Sí", "Sí", "Sí", "Sí", "Sí", "Sí"] },
  { label: "Música", values: ["-", "Sí", "Sí", "Sí", "Sí", "Sí"] },
  { label: "Cuenta regresiva", values: ["-", "Sí", "Sí", "Sí", "Sí", "Sí"] },
  { label: "Galería", values: ["1 foto", "5 fotos", "Premium", "Premium", "Premium", "Premium"] },
  { label: "Itinerario", values: ["-", "-", "Sí", "Sí", "Sí", "Sí"] },
  { label: "Confirmación de asistencia", values: ["Por WhatsApp", "No incluida", "Por WhatsApp", "Formulario", "Formulario + registro", "Sistema avanzado"] },
  { label: "Pases personalizados", values: ["-", "-", "-", "Sí", "Sí", "Sí"] },
  { label: "Base de datos", values: ["-", "-", "-", "-", "Sí", "Sí"] },
  { label: "QR individual", values: ["-", "-", "-", "-", "Sí", "Sí"] },
  { label: "Panel administrativo", values: ["-", "-", "-", "-", "Básico", "Completo"] },
  { label: "Escáner QR celular", values: ["-", "-", "-", "-", "-", "Sí"] },
  { label: "Control de acceso", values: ["-", "-", "-", "-", "-", "Sí"] },
  { label: "Registro de entrada", values: ["-", "-", "-", "-", "-", "Sí"] }
];

export function getPackage(packageKey) {
  return packages.find((item) => item.key === packageKey) || packages[2];
}

export function resolvePackage(packageKey, overrides = {}) {
  const selected = getPackage(packageKey);
  return { ...selected, features: { ...selected.features, ...overrides } };
}
