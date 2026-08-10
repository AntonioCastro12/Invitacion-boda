"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, Upload } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import SectionHeading from "./SectionHeading";

const demoPhotos = [
  { id: "demo-1", url: "/images/pareja-4.jpg", uploader: "Familia Castro" },
  { id: "demo-2", url: "/images/pareja-5.jpg", uploader: "Amigos de los novios" },
];

export default function CollaborativeAlbum() {
  const [photos, setPhotos] = useState(demoPhotos);
  const [albumUrl, setAlbumUrl] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  useEffect(() => {
    setAlbumUrl(`${window.location.origin}/#album-colaborativo`);
  }, []);

  const uploadPhoto = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.photo.files?.[0];
    if (!file) return;
    setPhotos((current) => [{
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      uploader: "Invitado de demostración",
    }, ...current]);
    form.reset();
    setStatus({ type: "success", message: "¡Fotografía agregada a la demostración!" });
  };

  return (
    <section id="album-colaborativo" className="section album-section" aria-labelledby="album-title">
      <SectionHeading
        eyebrow="Recuerdos compartidos"
        title="Álbum colaborativo"
        description="Comparte las fotografías que captures durante nuestra celebración."
      />

      <motion.div
        className="album-upload"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
      >
        <div className="album-upload__qr" aria-hidden={!albumUrl}>
          {albumUrl ? <QRCodeSVG value={albumUrl} size={112} bgColor="#fffdf8" fgColor="#4e5742" level="M" /> : <Camera size={42} />}
          <span>Escanea para compartir</span>
        </div>
        <form onSubmit={uploadPhoto} className="album-upload__form">
          <ImagePlus size={28} strokeWidth={1.2} aria-hidden="true" />
          <strong id="album-title">Sube tu mejor momento</strong>
          <span>Función simulada para la presentación.</span>
          <label className="button button--primary album-upload__picker">
            <Upload size={16} /> Seleccionar fotografía
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <button className="button button--outline" type="submit">Compartir en el álbum</button>
          {status.message && <p className={`form-status form-status--${status.type}`} role="status">{status.message}</p>}
        </form>
      </motion.div>

      <div className="album-grid">
        {photos.map((photo, index) => (
          <motion.figure
            key={photo.id}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(index * 0.06, 0.3) }}
          >
            <img src={photo.url} alt={`Recuerdo compartido por ${photo.uploader}`} loading="lazy" />
            <figcaption>{photo.uploader}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
