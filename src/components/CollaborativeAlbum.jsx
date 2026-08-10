"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import SectionHeading from "./SectionHeading";

export default function CollaborativeAlbum({ token }) {
  const [photos, setPhotos] = useState([]);
  const [origin, setOrigin] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const loadPhotos = async () => {
    try {
      const response = await fetch("/api/album");
      const payload = await response.json();
      if (response.ok) setPhotos(payload.photos ?? []);
    } catch {
      // El álbum puede estar vacío o desconectado durante una vista previa local.
    }
  };

  useEffect(() => {
    setOrigin(window.location.origin);
    loadPhotos();
  }, []);

  const uploadPhoto = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.photo;
    if (!input.files?.[0]) return;

    setStatus({ type: "loading", message: "Subiendo recuerdo…" });
    const body = new FormData();
    body.set("token", token);
    body.set("photo", input.files[0]);

    try {
      const response = await fetch("/api/album", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible subir la fotografía.");
      form.reset();
      setStatus({ type: "success", message: "¡Gracias! Tu fotografía ya forma parte del álbum." });
      await loadPhotos();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "No fue posible subir la fotografía." });
    }
  };

  const albumUrl = origin ? `${origin}/i/${token}#album-colaborativo` : "";

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
          <span>Fotografías JPG, PNG o WEBP de hasta 10 MB.</span>
          <label className="button button--primary album-upload__picker">
            <Upload size={16} /> Seleccionar fotografía
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <button className="button button--outline" type="submit" disabled={status.type === "loading"}>
            {status.type === "loading" ? <><LoaderCircle className="spin" size={16} /> Subiendo…</> : "Compartir en el álbum"}
          </button>
          {status.message && <p className={`form-status form-status--${status.type}`} role="status">{status.message}</p>}
        </form>
      </motion.div>

      {photos.length > 0 ? (
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
      ) : (
        <p className="album-empty">Sé la primera persona en compartir un recuerdo de este día.</p>
      )}
    </section>
  );
}
