import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authenticateDemoAccount, clearDemoActiveProject } from "../services/demoPlatformService";
import { isDemoMode, supabase } from "../services/supabase";

const AuthContext = createContext(null);

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre, email, rol")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(isDemoMode || !supabase ? null : undefined);
  const [profile, setProfile] = useState(isDemoMode || !supabase ? null : undefined);

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
      setProfile(session?.profile || null);
      return;
    }
    if (!session?.user || !supabase) {
      setProfile(null);
      return;
    }
    let active = true;
    setProfile(undefined);
    fetchProfile(session.user.id)
      .then((data) => active && setProfile(data))
      .catch(() => active && setProfile(null));
    return () => { active = false; };
  }, [session]);

  async function signIn(email, password) {
    if (isDemoMode) {
      if (!email || !password) throw new Error("Escribe un correo y una contraseña para entrar a la demostración.");
      const nextProfile = authenticateDemoAccount(email, password);
      setSession({ user: { id: nextProfile.id, email: nextProfile.email }, profile: nextProfile });
      return nextProfile;
    }
    if (!supabase) throw new Error("El acceso real necesita las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Para usar las cuentas de muestra, activa VITE_DEMO_MODE=true.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const signedProfile = await fetchProfile(data.user.id);
    setSession(data.session);
    setProfile(signedProfile);
    return signedProfile;
  }

  async function signOut() {
    if (isDemoMode) { clearDemoActiveProject(); setSession(null); }
    else if (supabase) await supabase.auth.signOut();
  }

  const loading = session === undefined || Boolean(session?.user && profile === undefined);
  const value = useMemo(() => ({ session, profile, loading, signIn, signOut, isDemoMode }), [session, profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return value;
}
