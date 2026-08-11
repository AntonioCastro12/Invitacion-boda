import { LoaderCircle } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="state-page"><LoaderCircle className="spin" /><p>Verificando acceso…</p></main>;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
