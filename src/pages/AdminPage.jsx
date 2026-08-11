import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminPage() {
  const { profile } = useAuth();
  if (profile?.rol !== "super_admin") return <main className="state-page"><ShieldCheck size={42} /><h1>Área reservada</h1><p>La administración global de RCM Code Dev estará disponible para cuentas super_admin.</p><Link className="button button--dark" to="/panel"><ArrowLeft size={18} /> Volver al panel</Link></main>;
  return <main className="state-page"><ShieldCheck size={42} /><h1>RCM Super Admin</h1><p>La arquitectura de roles está lista. La gestión global de eventos se incorporará en la siguiente etapa.</p><Link className="button button--dark" to="/panel">Ir a mi panel</Link></main>;
}
