import { BarChart3, CalendarCog, CheckCircle2, Images, LayoutDashboard, LockKeyhole, LogOut, ScanLine, Menu, Users, X } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ open, setOpen, onSignOut, features }) {
  const links = [
    { to: "/panel", label: "Dashboard", icon: LayoutDashboard, end: true, enabled: true },
    { to: "/panel/invitados", label: "Invitados", icon: Users, enabled: features?.admin_panel },
    { to: "/panel/confirmaciones", label: "Confirmaciones", icon: CheckCircle2, enabled: features?.form_rsvp || features?.database_rsvp },
    { to: "/panel/album", label: "Álbum", icon: Images, enabled: features?.collaborative_album },
    { to: "/panel/acceso", label: "Control de acceso", icon: ScanLine, enabled: features?.access_control },
    { to: "/panel/estadisticas", label: "Estadísticas", icon: BarChart3, enabled: features?.statistics },
    { to: "/panel/configuracion", label: "Configuración", icon: CalendarCog, enabled: features?.admin_panel }
  ];
  return <><button className="mobile-menu" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu /></button><button type="button" aria-label="Cerrar menú" className={`sidebar-backdrop ${open ? "is-visible" : ""}`} onClick={() => setOpen(false)} /><aside className={`sidebar ${open ? "is-open" : ""}`}><div className="sidebar-head"><span className="brand brand--light"><span>RCM</span> Invitaciones</span><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X /></button></div><nav>{links.map(({ to, label, icon: Icon, end, enabled }) => enabled ? <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><Icon size={19} /> {label}</NavLink> : <span className="sidebar-locked" key={to}><Icon size={19} /> {label}<LockKeyhole size={13} /></span>)}</nav><button className="sidebar-logout" type="button" onClick={onSignOut}><LogOut size={18} /> Cerrar sesión</button></aside></>;
}
