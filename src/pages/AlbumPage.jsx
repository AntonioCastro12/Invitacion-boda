import { ArrowLeft, Camera, Heart, ImagePlus, Info, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGuest } from "../hooks/useGuest";
import { isSharedAlbumEnabled, listAlbumPhotos, removeAlbumPhoto, uploadAlbumPhotos } from "../services/albumService";

function FeedPhoto({ photo, onDelete }) {
  const [liked, setLiked] = useState(false);
  const localUrl = useMemo(() => photo.blob ? URL.createObjectURL(photo.blob) : null, [photo.blob]);
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);
  return <article className="album-feed-card"><header><span className="album-feed-avatar">{photo.author.slice(0, 1).toUpperCase()}</span><div><strong>{photo.author}</strong><time dateTime={photo.createdAt}>{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(photo.createdAt))}</time></div>{photo.local && <button type="button" onClick={() => onDelete(photo)} aria-label="Eliminar fotografía local"><Trash2 size={17} /></button>}</header><img src={localUrl || photo.url} alt={`Recuerdo compartido por ${photo.author}`} /><footer><button className={liked ? "is-liked" : ""} type="button" onClick={() => setLiked(!liked)} aria-label={liked ? "Quitar Me gusta" : "Me gusta"}><Heart size={23} fill={liked ? "currentColor" : "none"} /></button><span>{liked ? "Te gusta esta fotografía" : "Un recuerdo de nuestra celebración"}</span>{photo.sample && <small>Foto de muestra</small>}</footer></article>;
}

export default function AlbumPage() {
  const { eventoSlug, codigoInvitado } = useParams();
  const { invitation, loading, error } = useGuest(eventoSlug, codigoInvitado);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const inputRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!invitation) return;
    try { setPhotos((await listAlbumPhotos(invitation.event, invitation.guest)).photos); }
    catch (reason) { setNotice(reason.message || "No pudimos abrir el álbum compartido."); }
  }, [invitation]);

  useEffect(() => { refresh(); }, [refresh]);

  async function upload(event) {
    const files = event.target.files;
    if (!files?.length || !invitation) return;
    setUploading(true); setNotice("");
    try { await uploadAlbumPhotos(invitation.event, invitation.guest, files); await refresh(); setNotice(`${files.length} ${files.length === 1 ? "fotografía publicada" : "fotografías publicadas"} correctamente.`); }
    catch (reason) { setNotice(reason.message || "No fue posible publicar las fotografías."); }
    finally { setUploading(false); event.target.value = ""; }
  }

  async function remove(photo) {
    if (!window.confirm("¿Eliminar esta fotografía del dispositivo?")) return;
    try { await removeAlbumPhoto(photo); await refresh(); setNotice("Fotografía local eliminada."); }
    catch (reason) { setNotice(reason.message); }
  }

  if (loading) return <main className="state-page"><span className="loader" /><h1>Abriendo el álbum…</h1></main>;
  if (error || !invitation) return <main className="state-page"><span className="state-mark">✦</span><h1>Este álbum no está disponible.</h1><p>{error || "Comprueba el enlace o vuelve a abrirlo desde la invitación."}</p></main>;
  const { event, guest } = invitation;

  return <main className="local-album-page shared-album-page"><header className="local-album-hero"><Link to={`/evento/${event.slug}/${guest.code}`}><ArrowLeft size={18} /> Volver a la invitación</Link><div><Camera size={28} /><span>Álbum compartido de</span><h1>{event.name}</h1><p>Un feed creado por todos los que forman parte de este día.</p></div></header><section className="shared-album-content">{!isSharedAlbumEnabled && <div className="local-storage-alert"><Info size={20} /><div><strong>Vista de demostración</strong><p>Conecta Supabase y ejecuta la migración del álbum para que las fotos sean visibles desde todos los dispositivos.</p></div></div>}<div className="shared-album-toolbar"><div><span>Publicando como</span><strong>{guest.name}</strong><small>{photos.length} recuerdos en el feed</small></div><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={upload} hidden /><button className="button button--gold" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}><Upload size={18} /> {uploading ? "Publicando…" : "Compartir fotos"}</button></div>{notice && <div className="album-notice" role="status">{notice}</div>}{photos.length ? <div className="album-social-feed">{photos.map((photo) => <FeedPhoto key={photo.id} photo={photo} onDelete={remove} />)}</div> : <div className="local-album-empty"><ImagePlus size={40} /><h2>Aún no hay fotografías</h2><p>Sé la primera persona en compartir un recuerdo de esta celebración.</p><button className="button button--olive" type="button" onClick={() => inputRef.current?.click()}><Upload size={18} /> Seleccionar fotografías</button></div>}</section></main>;
}
