import { ExternalLink, ImagePlus, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { listAlbumPhotos, sampleAlbumPhotos } from "../../services/albumService";

function PreviewPhoto({ photo }) {
  const localUrl = useMemo(() => photo.blob ? URL.createObjectURL(photo.blob) : null, [photo.blob]);
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);
  return <img src={localUrl || photo.url} alt={`Fotografía reciente de ${photo.author}`} loading="lazy" decoding="async" />;
}

export default function CollaborativeAlbum({ event, guest }) {
  const baseUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  const albumUrl = `${baseUrl}/album/${event.slug}/${guest.code}`;
  const qrColors = event.slug === "dulce-eduardo"
    ? { background: "#fff8e8", foreground: "#3a381e" }
    : { background: "#fffdf8", foreground: "#4e5742" };
  const [recent, setRecent] = useState(() => event.slug === "dulce-eduardo" ? sampleAlbumPhotos : []);

  useEffect(() => {
    let active = true;
    listAlbumPhotos(event, guest).then(({ photos }) => { if (active) setRecent(photos.slice(0, 4)); }).catch(() => {});
    return () => { active = false; };
  }, [event, guest]);

  return <section className="invitation-section album-section"><ImagePlus className="section-icon" /><p className="section-intro">Recuerdos compartidos</p><h2>Álbum digital</h2><p>Mira los momentos más recientes y comparte las fotografías que captures durante nuestra celebración.</p><div className="album-recent-preview">{recent.slice(0, 4).map((photo) => <PreviewPhoto key={photo.id} photo={photo} />)}</div><div className="album-access-card album-access-card--social"><div className="album-qr album-qr--compact" aria-label="Código QR para abrir el álbum digital"><QRCodeSVG value={albumUrl} size={112} bgColor={qrColors.background} fgColor={qrColors.foreground} level="M" /></div><div className="album-access-card__copy"><QrCode size={22} /><strong>Todos pueden ver y compartir</strong><span>Escanea el QR o abre el álbum para ver el feed completo.</span><a className="button button--olive" href={albumUrl} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Abrir álbum digital</a></div></div></section>;
}
