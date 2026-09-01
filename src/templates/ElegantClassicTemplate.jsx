import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import CalendarSection from "../components/invitation/CalendarSection";
import CollaborativeAlbum from "../components/invitation/CollaborativeAlbum";
import Countdown from "../components/invitation/Countdown";
import DressCode from "../components/invitation/DressCode";
import FinalMessage from "../components/invitation/FinalMessage";
import Footer from "../components/invitation/Footer";
import GiftRegistry from "../components/invitation/GiftRegistry";
import Hero from "../components/invitation/Hero";
import Itinerary from "../components/invitation/Itinerary";
import Location from "../components/invitation/Location";
import MusicPlayer from "../components/invitation/MusicPlayer";
import PersonalizedPass from "../components/invitation/PersonalizedPass";
import SectionReveal from "../components/invitation/SectionReveal";
import StoryGallery from "../components/invitation/StoryGallery";
import WelcomeScreen from "../components/invitation/WelcomeScreen";
import WeddingVideo from "../components/invitation/WeddingVideo";
import WhatsAppConfirmation from "../components/invitation/WhatsAppConfirmation";
import RsvpFormDemo from "../components/invitation/RsvpFormDemo";
import "../styles/dulce-eduardo-theme.css";

export default function ElegantClassicTemplate({ event, guest }) {
  const config = event.template_config || {};
  const features = event.features || {
    music: true, countdown: true, premium_gallery: true, itinerary: true,
    whatsapp_rsvp: true, personalized_passes: true, collaborative_album: true,
    individual_qr: true
  };
  const [opened, setOpened] = useState(() => !features.animated_cover);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const gallery = (config.gallery || []).slice(0, event.gallery_limit || config.gallery?.length || 0);
  const invitationTheme = event.slug === "dulce-eduardo" ? "theme-dulce-eduardo" : "";

  async function openInvitation() {
    setOpened(true);
    if (features.music) {
      try { await audioRef.current?.play(); setPlaying(true); } catch { setPlaying(false); }
    }
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  async function toggleMusic() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) { await audioRef.current.play(); setPlaying(true); }
    else { audioRef.current.pause(); setPlaying(false); }
  }

  return (
    <div className={`invitation-page template-elegante-clasica ${invitationTheme}`}>
      {features.music && <audio ref={audioRef} src={event.music_url} loop preload="metadata" />}
      <AnimatePresence>{features.animated_cover && !opened && <WelcomeScreen event={event} onOpen={openInvitation} />}</AnimatePresence>
      {opened && features.music && <MusicPlayer playing={playing} onToggle={toggleMusic} />}
      <motion.main className="invitation-canvas" initial={false} animate={opened ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(5px)" }} aria-hidden={!opened}>
        <Hero event={event} opened={opened} />
        {features.countdown && <SectionReveal><Countdown event={event} /></SectionReveal>}
        {gallery.length > 0 && <SectionReveal><StoryGallery photos={gallery} /></SectionReveal>}
        {features.embedded_video && <SectionReveal><WeddingVideo source={config.video_url} poster={config.video_poster} /></SectionReveal>}
        {features.itinerary && <SectionReveal><Itinerary items={event.itinerary} /></SectionReveal>}
        {features.add_calendar && <SectionReveal><CalendarSection event={event} /></SectionReveal>}
        {features.google_maps && <SectionReveal><section className="invitation-section locations-section"><p className="section-intro">Cómo llegar</p><h2>Nuestros lugares</h2><p>Aquí comienza el camino hacia nuestro sí para siempre.</p><Location title="Ceremonia" name={event.ceremony_name} address={event.ceremony_address} lat={event.ceremony_lat} lng={event.ceremony_lng} image={config.ceremony_image} showWaze={features.maps_waze} /><Location title="Recepción" name={event.reception_name} address={event.reception_address} lat={event.reception_lat} lng={event.reception_lng} image={config.reception_image} showWaze={features.maps_waze} /></section></SectionReveal>}
        {features.personalized_passes && <SectionReveal><PersonalizedPass guest={guest} event={event} /></SectionReveal>}
        {features.whatsapp_rsvp && <SectionReveal><WhatsAppConfirmation event={event} guest={guest} /></SectionReveal>}
        {(features.form_rsvp || features.database_rsvp) && <SectionReveal><RsvpFormDemo event={event} guest={guest} /></SectionReveal>}
        {features.dress_code && <SectionReveal><DressCode config={config.dress_code} /></SectionReveal>}
        {features.gift_registry && <SectionReveal><GiftRegistry registries={event.gift_registry} bank={config.bank} /></SectionReveal>}
        {features.collaborative_album && <SectionReveal><CollaborativeAlbum event={event} guest={guest} /></SectionReveal>}
        {features.final_message && <SectionReveal><FinalMessage event={event} /></SectionReveal>}
        <Footer event={event} />
      </motion.main>
    </div>
  );
}
