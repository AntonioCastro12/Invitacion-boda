"use client";

import { useState } from "react";
import { LockKeyhole, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogin({ returnTo = "/admin" }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible iniciar sesión.");
      router.replace(returnTo);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No fue posible iniciar sesión.");
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={login}>
        <span className="admin-login__monogram" aria-hidden="true">D &amp; E</span>
        <p className="eyebrow">Invitación VIP</p>
        <h1>Panel administrativo</h1>
        <p>Ingresa la contraseña privada para gestionar invitados y accesos.</p>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            autoFocus
          />
        </label>
        {error && <div className="admin-notice admin-notice--error" role="alert">{error}</div>}
        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={16} /> : <LockKeyhole size={16} />}
          {loading ? "Entrando…" : "Entrar al panel"}
        </button>
        <a href="/">Volver a la invitación</a>
      </form>
    </main>
  );
}
