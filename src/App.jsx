import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./admin/ProtectedRoute";
import PanelLayout from "./admin/PanelLayout";
import LandingPage from "./pages/LandingPage";
import InvitationPage from "./pages/InvitationPage";
import AlbumPage from "./pages/AlbumPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GuestsPage from "./pages/GuestsPage";
import EventSettingsPage from "./pages/EventSettingsPage";
import ConfirmationsPage from "./pages/ConfirmationsPage";
import PanelAlbumPage from "./pages/PanelAlbumPage";
import CheckInPage from "./pages/CheckInPage";
import StatisticsPage from "./pages/StatisticsPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
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
  );
}
