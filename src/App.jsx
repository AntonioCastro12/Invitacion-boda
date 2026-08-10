"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WelcomeScreen from "./components/WelcomeScreen";
import Hero from "./components/Hero";
import MusicPlayer from "./components/MusicPlayer";
import Countdown from "./components/Countdown";
import Gallery from "./components/Gallery";
import WeddingVideo from "./components/WeddingVideo";
import Itinerary from "./components/Itinerary";
import Location from "./components/Location";
import RSVP from "./components/RSVP";
import InvitationPass from "./components/InvitationPass";
import DressCode from "./components/DressCode";
import Gifts from "./components/Gifts";
import FinalMessage from "./components/FinalMessage";
import Footer from "./components/Footer";
import SectionHeading from "./components/SectionHeading";
import BotanicalAccent from "./components/BotanicalAccent";
import ScrollProgress from "./components/ScrollProgress";
import AddToCalendar from "./components/AddToCalendar";
import CollaborativeAlbum from "./components/CollaborativeAlbum";
import SectionReveal from "./components/SectionReveal";
import { weddingData } from "./data/weddingData";

const DEMO_TOKEN = "familia-castro-cuevas";

export default function WeddingApp() {
  const [opened, setOpened] = useState(false);
  const [guest, setGuest] = useState(weddingData.guest);
  const [inviteToken, setInviteToken] = useState(DEMO_TOKEN);
  const musicRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("invitado")?.trim().slice(0, 100);
    const passes = Math.min(Math.max(Number(params.get("lugares")) || weddingData.guest.passes, 1), 20);
    const token = params.get("token")?.trim().slice(0, 80);
    if (name) setGuest({ name, passes });
    if (token) setInviteToken(token);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("invitation-locked", !opened);
    document.body.classList.toggle("invitation-locked", !opened);
    if (!opened) window.scrollTo({ top: 0, behavior: "auto" });

    return () => {
      root.classList.remove("invitation-locked");
      document.body.classList.remove("invitation-locked");
    };
  }, [opened]);

  const openInvitation = () => {
    musicRef.current?.play();
    setOpened(true);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  };

  return (
    <div className="site-shell">
      <AnimatePresence>
        {!opened && (
          <WelcomeScreen
            messages={weddingData.welcome}
            couple={weddingData.couple}
            dateDisplay={weddingData.dateDisplay}
            onOpen={openInvitation}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{opened && <ScrollProgress />}</AnimatePresence>
      <motion.main
        className="invitation"
        initial={false}
        animate={opened ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.985, filter: "blur(5px)" }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!opened}
        inert={!opened}
      >
        <Hero data={weddingData} opened={opened} />
        <SectionReveal direction="up"><Countdown date={weddingData.date} /></SectionReveal>
        <SectionReveal direction="left"><Gallery photos={weddingData.gallery} /></SectionReveal>
        <SectionReveal direction="right"><WeddingVideo video={weddingData.video} /></SectionReveal>
        <SectionReveal direction="up"><Itinerary items={weddingData.itinerary} /></SectionReveal>
        <SectionReveal direction="zoom"><AddToCalendar data={weddingData} /></SectionReveal>
        <SectionReveal direction="left">
          <section className="section locations-section" aria-labelledby="locations-title">
            <BotanicalAccent position="top-right" subtle />
            <SectionHeading
              eyebrow="Cómo llegar"
              title="Nuestros lugares"
              description="Aquí comienza el camino hacia nuestro sí para siempre."
            />
            <div className="locations-grid">
              <Location place={weddingData.ceremony} index={0} />
              <Location place={weddingData.reception} index={1} />
            </div>
          </section>
        </SectionReveal>
        <SectionReveal direction="right"><InvitationPass guest={guest} token={inviteToken} /></SectionReveal>
        <SectionReveal direction="up"><RSVP couple={weddingData.couple} whatsapp={weddingData.whatsapp} maxGuests={guest.passes} token={inviteToken} /></SectionReveal>
        <SectionReveal direction="left"><DressCode /></SectionReveal>
        <SectionReveal direction="right"><Gifts gifts={weddingData.gifts} bank={weddingData.bank} /></SectionReveal>
        <SectionReveal direction="up"><CollaborativeAlbum /></SectionReveal>
        <SectionReveal direction="zoom"><FinalMessage data={weddingData} /></SectionReveal>
      </motion.main>
      <SectionReveal direction="up"><Footer couple={weddingData.couple} /></SectionReveal>
      <MusicPlayer ref={musicRef} src={weddingData.music} />
    </div>
  );
}
