import { EyeOff, Images, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { hideOwnerAlbumPhoto, isVideoMedia, listOwnerAlbumPhotos, removeOwnerAlbumPhoto } from "../services/albumService";

function Photo({ photo, onHide, onDelete }) {
  const localUrl = useMemo(() => photo.blob ? URL.createObjectURL(photo.blob) : null, [photo.blob]);
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);
  const source = localUrl || photo.url;
  return <article>{isVideoMedia(photo) ? <video src={source} controls playsInline preload="metadata" aria-label={`Video de ${photo.author}`} /> : <img src={source} alt={`Fotografía de ${photo.author}`} loading="lazy" decoding="async" />}<div><span><strong>{photo.author}</strong><small>{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(photo.createdAt))}</small></span><span className="album-actions"><button type="button" onClick={() => onHide(photo)} aria-label="Ocultar recuerdo"><EyeOff /></button><button type="button" className="album-delete" onClick={() => onDelete(photo)} aria-label="Eliminar recuerdo"><Trash2 /></button></span></div></article>;
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
  async function deletePhoto(photo) { if (!window.confirm("¿Eliminar definitivamente esta fotografía del álbum? Se borrará el archivo y no se podrá recuperar.")) return; try { await removeOwnerAlbumPhoto(event, photo); await load(); setNotice("Fotografía eliminada definitivamente."); } catch (error) { setNotice(error.message); } }
  return <section><header className="page-header"><div><span className="page-eyebrow">Moderación privada</span><h1>Álbum digital</h1><p>Las fotografías y videos pertenecen exclusivamente a {event.name}.</p></div></header><div className="privacy-callout"><ShieldCheck /><div><strong>Álbum aislado por evento</strong><p>Los invitados de otras celebraciones no pueden consultar ni publicar en este álbum. Las URLs reales caducan automáticamente.</p></div></div>{notice && <div className="album-notice">{notice}</div>}{photos.length ? <div className="panel-album-grid">{photos.map((photo) => <Photo key={photo.id} photo={photo} onHide={hide} onDelete={deletePhoto} />)}</div> : <div className="empty-state"><Images /><h3>Aún no hay recuerdos</h3><p>Las fotografías y videos que compartan los invitados aparecerán aquí.</p></div>}</section>;
}
