import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const ProtectedRoute = lazy(() => import("./admin/ProtectedRoute"));
const PanelLayout = lazy(() => import("./admin/PanelLayout"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const InvitationPage = lazy(() => import("./pages/InvitationPage"));
const AlbumPage = lazy(() => import("./pages/AlbumPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const GuestsPage = lazy(() => import("./pages/GuestsPage"));
const EventSettingsPage = lazy(() => import("./pages/EventSettingsPage"));
const ConfirmationsPage = lazy(() => import("./pages/ConfirmationsPage"));
const PanelAlbumPage = lazy(() => import("./pages/PanelAlbumPage"));
const CheckInPage = lazy(() => import("./pages/CheckInPage"));
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function RouteLoading() {
  return (
    <main className="state-page" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      <p>Cargando…</p>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/evento/:eventoSlug/:codigoInvitado" element={<InvitationPage />} />
        <Route path="/album/:eventoSlug/:codigoInvitado" element={<AlbumPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/panel" element={<PanelLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="invitados" element={<GuestsPage />} />
            <Route path="confirmaciones" element={<ConfirmationsPage />} />
            <Route path="album" element={<PanelAlbumPage />} />
            <Route path="acceso" element={<CheckInPage />} />
            <Route path="estadisticas" element={<StatisticsPage />} />
            <Route path="configuracion" element={<EventSettingsPage />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
