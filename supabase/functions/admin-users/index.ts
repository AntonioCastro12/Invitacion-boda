import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authorization = request.headers.get("Authorization") || "";
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Sesión no válida" }, 401);

    const { data: caller } = await admin.from("profiles").select("rol").eq("id", authData.user.id).single();
    if (caller?.rol !== "super_admin") return json({ error: "Acceso reservado al superadministrador" }, 403);

    const payload = await request.json();
    if (payload.action !== "upsert_client") return json({ error: "Acción no válida" }, 400);
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    if (!name || !email) return json({ error: "Nombre y correo son obligatorios" }, 400);
    if (password && password.length < 6) return json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);

    const { data: existing } = await admin.from("profiles").select("id,email").eq("email", email).maybeSingle();
    let userId = existing?.id;
    if (userId) {
      const attributes: Record<string, unknown> = { email, user_metadata: { nombre: name } };
      if (password) attributes.password = password;
      const { error } = await admin.auth.admin.updateUserById(userId, attributes);
      if (error) return json({ error: error.message }, 400);
    } else {
      if (!password) return json({ error: "Escribe una contraseña temporal para la cuenta nueva" }, 400);
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nombre: name } });
      if (error) return json({ error: error.message }, 400);
      userId = data.user.id;
    }

    const { error: profileError } = await admin.from("profiles").update({ nombre: name, email, rol: "cliente" }).eq("id", userId);
    if (profileError) return json({ error: profileError.message }, 400);
    return json({ user: { id: userId, email, name } });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "No fue posible administrar la cuenta" }, 500);
  }
});
