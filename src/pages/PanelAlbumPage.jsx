import { EyeOff, Images, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { hideOwnerAlbumPhoto, listOwnerAlbumPhotos } from "../services/albumService";

function Photo({ photo, onHide }) {
  const localUrl = useMemo(() => photo.blob ? URL.createObjectURL(photo.blob) : null, [photo.blob]);
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);
  return <article><img src={localUrl || photo.url} alt={`Fotografía de ${photo.author}`} loading="lazy" decoding="async" /><div><span><strong>{photo.author}</strong><small>{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(photo.createdAt))}</small></span>{!photo.sample && <button type="button" onClick={() => onHide(photo)} aria-label="Ocultar fotografía"><EyeOff /></button>}</div></article>;
}

export default function PanelAlbumPage() {
  const { event, loading } = useEvent();
  const [photos, setPhotos] = useState([]);
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => { if (event) try { setPhotos((await listOwnerAlbumPhotos(event)).photos); } catch (error) { setNotice(error.message); } }, [event]);
  useEffect(() => { load(); }, [load]);
  if (loading || !event) return <div className="panel-loading">Cargando álbum…</div>;
  if (!event.features?.collaborative_album) return <section className="locked-feature"><span>Función no incluida</span><h1>Álbum colaborativo</h1><p>Este módulo puede activarse como extra o mediante el paquete VIP.</p><Link className="button button--dark" to="/panel">Volver al dashboard</Link></section>;
  async function hide(photo) { if (!window.confirm("¿Ocultar esta fotografía del álbum?")) return; try { await hideOwnerAlbumPhoto(photo); await load(); setNotice("Fotografía retirada del feed."); } catch (error) { setNotice(error.message); } }
  return <section><header className="page-header"><div><span className="page-eyebrow">Moderación privada</span><h1>Álbum digital</h1><p>Las fotografías pertenecen exclusivamente a {event.name}.</p></div><Link className="button button--dark" to={`/album/${event.slug}/A7X92`} target="_blank"><Images size={17} /> Ver álbum</Link></header><div className="privacy-callout"><ShieldCheck /><div><strong>Álbum aislado por evento</strong><p>Los invitados de otras celebraciones no pueden consultar ni publicar en este álbum. Las URLs reales caducan automáticamente.</p></div></div>{notice && <div className="album-notice">{notice}</div>}<div className="panel-album-grid">{photos.map((photo) => <Photo key={photo.id} photo={photo} onHide={hide} />)}</div></section>;
}
