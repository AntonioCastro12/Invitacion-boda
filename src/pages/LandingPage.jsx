import { ArrowRight, CalendarHeart, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { isDemoMode } from "../services/supabase";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="public-nav"><Link className="brand" to="/"><span>RCM</span> Invitaciones</Link><Link className="button button--dark" to="/login">Acceso clientes</Link></nav>
      {isDemoMode && <div className="demo-banner">Modo demostración · Conecta Supabase para utilizar datos reales</div>}
      <section className="landing-hero">
        <div><span className="landing-pill">Invitaciones digitales con gestión inteligente</span><h1>Cada evento merece una experiencia <em>inolvidable.</em></h1><p>Crea invitaciones personalizadas, organiza familias y comparte cada enlace en segundos desde un panel elegante y seguro.</p><div className="hero-actions"><Link className="button button--gold" to="/evento/dulce-eduardo/A7X92">Ver invitación de muestra <ArrowRight size={18} /></Link><Link className="button button--light" to="/login">Explorar el panel</Link></div></div>
        <div className="landing-preview"><span>Invitación privada</span><h2>Fernanda <small>&</small> Daniel</h2><p>10 · octubre · 2026</p><div className="preview-pass">Familia Hernández <strong>4 lugares</strong></div></div>
      </section>
      <section className="feature-grid">
        <article><CalendarHeart /><h3>Multi-evento</h3><p>Una base reutilizable para bodas, XV años, bautizos y celebraciones.</p></article>
        <article><Users /><h3>Cada familia es única</h3><p>Nombre, pases, teléfono y enlace privado generados automáticamente.</p></article>
        <article><ShieldCheck /><h3>Datos protegidos</h3><p>Acceso aislado por cliente mediante autenticación y políticas RLS.</p></article>
      </section>
    </main>
  );
}
