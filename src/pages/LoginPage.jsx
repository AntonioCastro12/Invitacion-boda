import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDemoLoginAccounts } from "../services/demoPlatformService";

export default function LoginPage() {
  const { session, loading, signIn, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const demoAccounts = isDemoMode ? getDemoLoginAccounts() : [];
  const defaultDemoAccount = demoAccounts.find((account) => account.role === "cliente");
  const [form, setForm] = useState({ email: defaultDemoAccount?.email || "", password: defaultDemoAccount?.password || "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!loading && session) return <Navigate to={session.profile?.rol === "super_admin" ? "/admin" : "/panel"} replace />;

  async function submit(e) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const signedProfile = await signIn(form.email, form.password);
      navigate(location.state?.from || (signedProfile?.rol === "super_admin" ? "/admin" : "/panel"), { replace: true });
    }
    catch (reason) { setError(reason.message || "No fue posible iniciar sesión."); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual"><Link className="brand brand--light" to="/"><span>RCM</span> Invitaciones</Link><div><span className="eyebrow">Tu evento, bajo control</span><h1>Bienvenidos de nuevo.</h1><p>Gestiona invitados y comparte invitaciones personalizadas desde un solo lugar.</p></div></section>
      <section className="auth-form-wrap"><Link className="back-link" to="/"><ArrowLeft size={17} /> Volver al inicio</Link><form className="auth-form" onSubmit={submit}><span className="auth-icon"><LockKeyhole /></span><h2>Iniciar sesión</h2><p>Ingresa con la cuenta vinculada a tu evento.</p>{isDemoMode && <div className="demo-access"><strong>Cuentas para la demostración</strong>{demoAccounts.map((account) => <button key={account.id} type="button" onClick={() => setForm({ email: account.email, password: account.password })}><span>{account.label}</span><small>{account.email} · {account.password}</small></button>)}</div>}{error && <div className="error-callout" role="alert">{error}</div>}<label>Correo electrónico<input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><label>Contraseña<input type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label><button className="button button--gold button--full" disabled={submitting}>{submitting ? "Ingresando…" : "Iniciar sesión"}</button></form></section>
    </main>
  );
}
