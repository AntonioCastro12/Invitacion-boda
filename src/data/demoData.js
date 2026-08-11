export const demoEvent = {
  id: "11111111-1111-4111-8111-111111111111",
  client_id: "demo-client",
  name: "Dulce & Eduardo",
  slug: "dulce-eduardo",
  event_type: "Boda",
  event_date: "2026-10-10",
  event_time: "17:00:00",
  plan: "elegante",
  template_key: "elegante-clasica",
  template_config: {
    gallery: ["/images/pareja-1.jpg", "/images/pareja-2.jpg", "/images/pareja-3.jpg", "/images/pareja-4.jpg", "/images/pareja-5.jpg"],
    video_url: "/video/nuestra-historia.mp4",
    video_poster: "/images/pareja-3.jpg",
    ceremony_image: "/images/pareja-3.jpg",
    reception_image: "/images/pareja-5.jpg",
    dress_code: { title: "Formal" },
    bank: { bank: "Banco Nacional", holder: "Dulce & Eduardo", clabe: "000 000 0000000000 0" }
  },
  price_reference: 900,
  whatsapp: "5214623105704",
  ceremony_name: "Templo de San Francisco",
  ceremony_address: "Centro histórico, Guanajuato, Gto.",
  ceremony_lat: 21.01858,
  ceremony_lng: -101.25736,
  reception_name: "Hacienda San José Lavista",
  reception_address: "Camino a San José, Guanajuato, Gto.",
  reception_lat: 20.98718,
  reception_lng: -101.28054,
  music_url: "/audio/boda.mp3",
  itinerary: [
    { time: "5:00 PM", title: "Ceremonia", description: "Templo de San Francisco" },
    { time: "7:00 PM", title: "Recepción", description: "Hacienda San José Lavista" },
    { time: "8:00 PM", title: "Cena", description: "Compartamos la mesa" },
    { time: "9:00 PM", title: "Celebración", description: "¡A disfrutar juntos!" }
  ],
  gift_registry: [
    { name: "Liverpool", url: "https://www.liverpool.com.mx/tienda/home" },
    { name: "Amazon", url: "https://www.amazon.com.mx/registries" }
  ]
};

export const demoGuests = [
  { id: "g1", event_id: demoEvent.id, name: "Familia Hernández", phone: "524621234567", passes: 4, code: "A7X92", table_name: "Mesa 4", notes: "" },
  { id: "g2", event_id: demoEvent.id, name: "Familia Castro Cuevas", phone: "524621112233", passes: 5, code: "B8K31", table_name: "Mesa 2", notes: "Familia de la novia" },
  { id: "g3", event_id: demoEvent.id, name: "María López", phone: "524621223344", passes: 2, code: "D9P21", table_name: "Mesa 6", notes: "" },
  { id: "g4", event_id: demoEvent.id, name: "José Ramírez", phone: "524621334455", passes: 1, code: "F4M67", table_name: "Mesa 7", notes: "" }
];

export const demoProfile = { id: "demo-client", nombre: "Dulce y Eduardo", email: "demo@rcminvitaciones.com", rol: "cliente" };
