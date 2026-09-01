export const demoEvent = {
  id: "11111111-1111-4111-8111-111111111111",
  client_id: "demo-client",
  name: "Dulce & Eduardo",
  slug: "dulce-eduardo",
  event_type: "Boda",
  event_date: "2026-10-10",
  event_time: "14:00:00",
  plan: "elegante",
  template_key: "elegante-clasica",
  template_config: {
    gallery: [
      "/images/dulce-eduardo-historia-01.jpg",
      "/images/dulce-eduardo-historia-02.jpg",
      "/images/dulce-eduardo-historia-03.jpg",
      "/images/dulce-eduardo-historia-04.jpg",
      "/images/dulce-eduardo-historia-05.jpg"
    ],
    video_url: "/video/nuestra-historia.mp4",
    video_poster: "/images/dulce-eduardo-historia-02.jpg",
    ceremony_image: "/images/dulce-eduardo-historia-04.jpg",
    reception_image: "/images/dulce-eduardo-historia-03.jpg",
    dress_code: { title: "Formal" },
    bank: { bank: "Banco Nacional", holder: "Dulce & Eduardo", clabe: "000 000 0000000000 0" }
  },
  price_reference: 900,
  whatsapp: "5214623105704",
  ceremony_name: "Templo Hospitalito",
  ceremony_address: "Misa · 2:00 p. m.",
  ceremony_lat: null,
  ceremony_lng: null,
  reception_name: "Salón Casa de Adobe",
  reception_address: "Recepción · 4:00 p. m.",
  reception_lat: null,
  reception_lng: null,
  music_url: "/audio/boda.mp3",
  itinerary: [
    { time: "2:00 PM", title: "Misa", description: "Templo Hospitalito" },
    { time: "4:00 PM", title: "Recepción", description: "Salón Casa de Adobe" },
    { time: "5:00 PM", title: "Entrada de los novios", description: "Comienza nuestra celebración" },
    { time: "5:15 PM", title: "Comida", description: "Compartamos la mesa" },
    { time: "6:30 PM", title: "Vals de los novios", description: "Nuestro primer baile" },
    { time: "7:00 PM", title: "Baile", description: "¡A celebrar juntos!" },
    { time: "12:00 AM", title: "Fin de la fiesta", description: "Gracias por acompañarnos" }
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
