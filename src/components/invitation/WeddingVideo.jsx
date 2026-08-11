import { Film } from "lucide-react";
import { useEffect, useRef } from "react";

export default function WeddingVideo({ source = "/video/nuestra-historia.mp4", poster = "/images/pareja-3.jpg" }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || !window.IntersectionObserver) return undefined;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting ? video.play().catch(() => {}) : video.pause(), { threshold: .45 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return <section className="invitation-section video-section"><Film className="section-icon" /><p className="section-intro">Nuestra historia</p><h2>Un pedacito de nuestro camino</h2><div className="classic-video"><video ref={ref} src={source} poster={poster} muted loop playsInline controls preload="metadata">Tu navegador no puede reproducir este video.</video></div></section>;
}
