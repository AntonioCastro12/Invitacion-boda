import { useParams } from "react-router-dom";
import InvitationTemplateRenderer from "../templates/InvitationTemplateRenderer";
import { useGuest } from "../hooks/useGuest";

export default function InvitationPage() {
  const { eventoSlug, codigoInvitado } = useParams();
  const { invitation, loading, error } = useGuest(eventoSlug, codigoInvitado);

  if (loading) return <main className="state-page"><span className="loader" /><h1>Preparando tu invitación…</h1></main>;
  if (error || !invitation) return <main className="state-page"><span className="state-mark">✦</span><h1>Esta invitación no está disponible.</h1><p>{error || "Verifica que el enlace esté escrito correctamente."}</p></main>;

  return <InvitationTemplateRenderer event={invitation.event} guest={invitation.guest} />;
}
