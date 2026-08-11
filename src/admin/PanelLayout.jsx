import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "./Sidebar";

export default function PanelLayout() {
  const [open, setOpen] = useState(false);
  const { profile, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  async function leave() { await signOut(); navigate("/login"); }
  return <div className="panel-shell"><Sidebar open={open} setOpen={setOpen} onSignOut={leave} /><main className="panel-content">{isDemoMode && <div className="panel-demo">Modo demostración: los cambios se reinician al recargar.</div>}<header className="panel-topbar"><div><span>Panel del cliente</span><strong>{profile?.nombre || profile?.email || "Mi evento"}</strong></div><div className="avatar">{(profile?.nombre || "RC").slice(0, 2).toUpperCase()}</div></header><Outlet /></main></div>;
}
