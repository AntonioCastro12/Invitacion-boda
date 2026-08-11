import { useCallback, useEffect, useState } from "react";
import { getMyEvent } from "../services/eventService";

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
  return { event, loading, error, refresh, setEvent };
}
