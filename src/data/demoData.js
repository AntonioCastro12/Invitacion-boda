export const demoEvent = {
  id: "11111111-1111-4111-8111-111111111111",
  client_id: "demo-client",
  name: "Eduardo y Dulce",
  slug: "dulce-eduardo",
  event_type: "Boda",
  event_date: "2026-11-28",
  event_time: "14:00:00",
  plan: "elegante",
  template_key: "elegante-clasica",
  template_config: {
    gallery: [
      "/images/dulce-eduardo-historia-01.jpg",
      "/images/dulce-eduardo-historia-02.jpg",
      "/images/dulce-eduardo-historia-03.jpg",
      "/images/dulce-eduardo-historia-04.jpg",
      "/images/dulce-eduardo-historia-05.jpg",
    ],
    video_url: "/video/eduardo-dulce-montaje.mp4",
    video_poster: "/images/dulce-eduardo-historia-02.jpg",
    album_cover: "/images/dulce-eduardo-album-destacada.jpg",
    ceremony_image: "/images/templo-hospitalito-sin-persona-optimized.jpg",
    reception_image: "/images/casa-de-adobe-optimized.jpg",
    confirmation_whatsapps: ["+52 1 462 632 1218", "+52 1 462 107 0085"],
    dress_code: { title: "Formal" },
  },
  price_reference: 900,
  whatsapp: "5214626321218",
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
    {
      time: "5:00 PM",
      title: "Entrada de los novios",
      description: "Comienza nuestra celebración",
    },
    { time: "5:15 PM", title: "Comida", description: "Compartamos la mesa" },
    {
      time: "6:30 PM",
      title: "Vals de los novios",
      description: "Nuestro primer baile",
    },
    { time: "7:00 PM", title: "Baile", description: "¡A celebrar juntos!" },
    {
      time: "12:00 AM",
      title: "Fin de la fiesta",
      description: "Gracias por acompañarnos",
    },
  ],
  gift_registry: [
    {
      name: "Liverpool",
      code: "60033184",
      url: "https://mesaderegalos.liverpool.com.mx/milistaderegalos/60033184",
    },
    { name: "Amazon", url: "https://www.amazon.com.mx/wedding/guest-view/1BDWDEA7A44XE" },
  ],
};

export const demoGuests = [];

export const demoProfile = {
  id: "demo-client",
  nombre: "Eduardo y Dulce",
  email: "demo@rcminvitaciones.com",
  rol: "cliente",
};
