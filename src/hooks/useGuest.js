import { useCallback, useEffect, useState } from "react";
import { getPublicInvitation } from "../services/eventService";

export function useGuest(eventSlug, guestCode) {
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setInvitation(await getPublicInvitation(eventSlug, guestCode));
      setError("");
    } catch (reason) {
      setError(reason.message || "No pudimos consultar la invitación.");
    } finally {
      setLoading(false);
    }
  }, [eventSlug, guestCode]);

  useEffect(() => { load(); }, [load]);
  return { invitation, loading, error };
}
