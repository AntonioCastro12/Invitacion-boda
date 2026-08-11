import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoProfile } from "../data/demoData";
import { isDemoMode, supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(isDemoMode ? null : undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isDemoMode || !supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => active && setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setProfile(session ? demoProfile : null);
      return;
    }
    if (!session?.user || !supabase) {
      setProfile(null);
      return;
    }
    supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle().then(({ data }) => setProfile(data));
  }, [session]);

  async function signIn(email, password) {
    if (isDemoMode) {
      if (!email || !password) throw new Error("Escribe un correo y una contraseña para entrar a la demostración.");
      setSession({ user: { id: demoProfile.id, email } });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    if (isDemoMode) setSession(null);
    else await supabase.auth.signOut();
  }

  const value = useMemo(() => ({ session, profile, loading: session === undefined, signIn, signOut, isDemoMode }), [session, profile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return value;
}
