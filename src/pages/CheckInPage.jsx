import { Camera, CheckCircle2, RotateCcw, ScanLine, Search, ShieldAlert, TicketCheck, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { extractGuestCode, listCheckIns, registerCheckIn, undoCheckIn } from "../services/checkInService";
import { listGuests } from "../services/guestService";

export default function CheckInPage() {
  const { event, loading } = useEvent();
  const [guests, setGuests] = useState([]); const [records, setRecords] = useState([]); const [code, setCode] = useState(""); const [selected, setSelected] = useState(null); const [attendees, setAttendees] = useState(1); const [notice, setNotice] = useState(""); const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null); const streamRef = useRef(null); const frameRef = useRef(null);
  const load = useCallback(async () => { if (!event) return; const nextGuests = await listGuests(event.id); setGuests(nextGuests); setRecords(await listCheckIns(event.id, nextGuests)); }, [event]);
  useEffect(() => { load().catch((error) => setNotice(error.message)); }, [load]);
  const stopCamera = useCallback(() => { if (frameRef.current) cancelAnimationFrame(frameRef.current); streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; setScanning(false); }, []);
  useEffect(() => stopCamera, [stopCamera]);
  const usedIds = useMemo(() => new Set(records.map((record) => record.guest_id)), [records]);
  if (loading || !event) return <div className="panel-loading">Preparando control de acceso…</div>;
  if (!event.features?.access_control) return <section className="locked-feature"><span>Función VIP</span><h1>Control de acceso</h1><p>La validación de entradas y prevención de duplicados está disponible en el paquete VIP.</p><Link className="button button--dark" to="/panel">Volver al dashboard</Link></section>;

  function findGuest(value = code) {
    const normalized = extractGuestCode(value); const guest = guests.find((item) => item.code === normalized);
    setSelected(guest || null); setAttendees(guest?.passes || 1); setNotice(guest ? "" : "No encontramos una invitación con ese código.");
  }
  async function register() { try { await registerCheckIn(event, selected, attendees); setNotice(`Entrada registrada para ${selected.name}.`); setSelected(null); setCode(""); await load(); } catch (error) { setNotice(error.message); } }
  async function startCamera() {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) { setNotice("Este navegador no admite lectura QR con cámara. Puedes escribir o pegar el código."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      streamRef.current = stream;
      setScanning(true);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (!videoRef.current) throw new Error("La vista de cámara no está disponible.");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const detect = async () => { if (!streamRef.current) return; try { const results = await detector.detect(videoRef.current); if (results[0]?.rawValue) { const found = extractGuestCode(results[0].rawValue); setCode(found); stopCamera(); findGuest(found); return; } } catch { /* continúa escaneando */ } frameRef.current = requestAnimationFrame(detect); };
      detect();
    } catch { setNotice("No fue posible abrir la cámara. Revisa los permisos del navegador."); stopCamera(); }
  }
  return <section><header className="page-header"><div><span className="page-eyebrow">Operación VIP</span><h1>Control de acceso</h1><p>Valida códigos, registra entradas y evita pases duplicados.</p></div>{event.features?.qr_scanner && <button className="button button--gold" type="button" onClick={scanning ? stopCamera : startCamera}><Camera size={18} /> {scanning ? "Cerrar cámara" : "Escanear QR"}</button>}</header>{scanning && <div className="scanner-camera"><video ref={videoRef} playsInline muted /><span><ScanLine /> Coloca el código QR dentro del recuadro</span></div>}<div className="access-stats"><article><TicketCheck /><span>Códigos utilizados<strong>{records.length}</strong></span></article><article><Users /><span>Personas ingresadas<strong>{records.reduce((sum, item) => sum + Number(item.attendees), 0)}</strong></span></article><article><CheckCircle2 /><span>Invitaciones disponibles<strong>{guests.length - records.length}</strong></span></article></div><div className="access-validator"><label htmlFor="access-code">Código o enlace de invitación</label><div><Search /><input id="access-code" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") findGuest(); }} placeholder="A7X92" /><button className="button button--dark" type="button" onClick={() => findGuest()}>Validar</button></div></div>{notice && <div className="album-notice" role="status">{notice}</div>}{selected && <article className={`access-result ${usedIds.has(selected.id) ? "is-used" : ""}`}>{usedIds.has(selected.id) ? <ShieldAlert /> : <CheckCircle2 />}<div><span>{usedIds.has(selected.id) ? "Código ya utilizado" : "Invitación válida"}</span><h2>{selected.name}</h2><p>{selected.passes} pases · {selected.table_name || "Sin mesa asignada"}</p></div>{!usedIds.has(selected.id) && <div><label>Personas<input type="number" min="1" max={selected.passes} value={attendees} onChange={(e) => setAttendees(e.target.value)} /></label><button className="button button--olive" type="button" onClick={register}>Registrar entrada</button></div>}</article>}<section className="access-history"><header><h2>Entradas registradas</h2><button type="button" onClick={load}><RotateCcw /> Actualizar</button></header>{records.map((record) => <article key={record.id}><CheckCircle2 /><div><strong>{record.guest.name}</strong><small>{record.attendees} personas · Código {record.guest.code}</small></div><time>{new Intl.DateTimeFormat("es-MX", { timeStyle: "short", dateStyle: "short" }).format(new Date(record.checked_in_at))}</time><button type="button" onClick={async () => { await undoCheckIn(event.id, record.id); await load(); }} aria-label={`Deshacer entrada de ${record.guest.name}`}>Deshacer</button></article>)}</section></section>;
}
