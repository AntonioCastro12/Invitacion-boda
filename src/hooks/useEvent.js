import { useCallback, useEffect, useState } from "react";
import { getMyEvent } from "../services/eventService";
import { subscribeDemoPlatform } from "../services/demoPlatformService";
import { isDemoMode } from "../services/supabase";

export function useEvent() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setEvent(await getMyEvent());
      setError("");
    } catch (reason) {
      setError(reason.message || "No pudimos cargar el evento.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!isDemoMode) return undefined;
    return subscribeDemoPlatform(() => refresh());
  }, [refresh]);
  return { event, loading, error, refresh, setEvent };
}
