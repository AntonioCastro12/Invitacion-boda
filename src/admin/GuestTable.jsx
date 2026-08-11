import { Copy, Edit3, ExternalLink, MessageCircle, Trash2 } from "lucide-react";
import { createWhatsAppUrl, invitationMessage } from "../utils/whatsapp";

export default function GuestTable({ event, guests, onEdit, onDelete, onCopy }) {
  const baseUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  if (!guests.length) return <div className="empty-state"><span>✦</span><h3>Aún no hay invitados</h3><p>Agrega la primera familia para generar su enlace personalizado.</p></div>;

  return (
    <div className="table-wrap">
      <table className="guest-table">
        <thead><tr><th>Familia / Invitado</th><th>Teléfono</th><th>Pases</th><th>Código</th><th>Enlace</th><th>Acciones</th></tr></thead>
        <tbody>{guests.map((guest) => {
          const url = `${baseUrl}/evento/${event.slug}/${guest.code}`;
          const whatsapp = createWhatsAppUrl(guest.phone, invitationMessage(event, guest, url));
          return (
            <tr key={guest.id}>
              <td data-label="Invitado"><strong>{guest.name}</strong><small>{guest.table_name || "Sin mesa"}</small></td>
              <td data-label="Teléfono">{guest.phone || "—"}</td>
              <td data-label="Pases"><span className="pass-badge">{guest.passes}</span></td>
              <td data-label="Código"><code>{guest.code}</code></td>
              <td data-label="Enlace"><span className="link-cell">{url}</span></td>
              <td data-label="Acciones">
                <div className="action-row">
                  <a href={url} target="_blank" rel="noreferrer" title="Ver invitación" aria-label={`Ver invitación de ${guest.name}`}><ExternalLink /></a>
                  <button type="button" onClick={() => onCopy(url)} title="Copiar enlace" aria-label={`Copiar enlace de ${guest.name}`}><Copy /></button>
                  <a href={whatsapp || "#"} target="_blank" rel="noreferrer" className={!whatsapp ? "disabled" : ""} title="Enviar por WhatsApp" aria-label={`Enviar invitación a ${guest.name} por WhatsApp`}><MessageCircle /></a>
                  <button type="button" onClick={() => onEdit(guest)} title="Editar" aria-label={`Editar a ${guest.name}`}><Edit3 /></button>
                  <button type="button" className="danger" onClick={() => onDelete(guest)} title="Eliminar" aria-label={`Eliminar a ${guest.name}`}><Trash2 /></button>
                </div>
              </td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}
