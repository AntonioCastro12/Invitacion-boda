import { ImagePlus, Upload } from "lucide-react";

export default function CollaborativeAlbum() {
  return <section className="invitation-section album-section"><ImagePlus className="section-icon" /><p className="section-intro">Recuerdos compartidos</p><h2>Álbum colaborativo</h2><p>Comparte las fotografías que captures durante nuestra celebración.</p><div className="album-demo"><div className="album-upload"><span>Escanea para compartir</span><strong>Sube tu mejor momento</strong><small>Función simulada para la presentación.</small><button className="button button--outline" type="button" disabled><Upload size={17} /> Seleccionar fotografía</button></div><div className="album-preview"><figure><img src="/images/pareja-4.jpg" alt="Ejemplo del álbum" /><figcaption>Familia Castro</figcaption></figure><figure><img src="/images/pareja-5.jpg" alt="Ejemplo del álbum" /><figcaption>Amigos de los novios</figcaption></figure></div></div></section>;
}
