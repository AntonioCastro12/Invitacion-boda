import { CalendarCog, LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/panel", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/panel/invitados", label: "Invitados", icon: Users },
  { to: "/panel/configuracion", label: "Configuración", icon: CalendarCog }
];

export default function Sidebar({ open, setOpen, onSignOut }) {
  return <><button className="mobile-menu" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu /></button><button type="button" aria-label="Cerrar menú" className={`sidebar-backdrop ${open ? "is-visible" : ""}`} onClick={() => setOpen(false)} /><aside className={`sidebar ${open ? "is-open" : ""}`}><div className="sidebar-head"><span className="brand brand--light"><span>RCM</span> Invitaciones</span><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X /></button></div><nav>{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><Icon size={19} /> {label}</NavLink>)}</nav><button className="sidebar-logout" type="button" onClick={onSignOut}><LogOut size={18} /> Cerrar sesión</button></aside></>;
}
