import { X } from "lucide-react";
import { useEffect, useState } from "react";

const empty = { name: "", phone: "", passes: 1, table_name: "", notes: "" };

export default function GuestForm({ guest, onSave, onClose, saving }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(guest ? {
      name: guest.name,
      phone: guest.phone || "",
      passes: guest.passes,
      table_name: guest.table_name || "",
      notes: guest.notes || ""
    } : empty);
  }, [guest]);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Escribe el nombre de la familia o invitado.");
    if (Number(form.passes) < 1) return setError("Debe asignarse al menos un pase.");
    setError("");
    await onSave({ ...form, name: form.name.trim(), phone: form.phone.trim(), passes: Number(form.passes) });
  }

  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="guest-form-title">
        <header>
          <div><span className="page-eyebrow">Invitados</span><h2 id="guest-form-title">{guest ? "Editar invitado" : "Agregar invitado"}</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X /></button>
        </header>
        <form onSubmit={submit}>
          {error && <div className="error-callout">{error}</div>}
          <label>Nombre / Familia *<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Familia Hernández" /></label>
          <div className="form-grid">
            <label>Teléfono<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="524621234567" /></label>
            <label>Número de pases *<input type="number" min="1" value={form.passes} onChange={(e) => setForm({ ...form, passes: e.target.value })} /></label>
          </div>
          <label>Mesa <small>Opcional</small><input value={form.table_name} onChange={(e) => setForm({ ...form, table_name: e.target.value })} placeholder="Mesa 4" /></label>
          <label>Observaciones <small>Opcional</small><textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          <footer>
            <button className="button button--light" type="button" onClick={onClose}>Cancelar</button>
            <button className="button button--gold" disabled={saving}>{saving ? "Guardando…" : "Guardar invitado"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
