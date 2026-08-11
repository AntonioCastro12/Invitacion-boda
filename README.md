# RCM Invitaciones

Plataforma React multi-evento para invitaciones digitales personalizadas. La Fase 1 incluye invitación pública, autenticación con Supabase, dashboard privado, CRUD de invitados, enlaces únicos y confirmación por WhatsApp.

## 1. Ejecutar la demostración

```bash
npm install
copy .env.example .env
npm run dev
```

Mientras `VITE_DEMO_MODE=true` y no existan credenciales de Supabase, la aplicación carga el evento Dulce & Eduardo y permite recorrer el panel. La información creada en este modo es temporal y se reinicia al recargar.

- Sitio: `http://localhost:5173`
- Invitación de muestra: `http://localhost:5173/evento/dulce-eduardo/A7X92`
- Login: `http://localhost:5173/login`
- En demo se puede entrar con los valores precargados.

## 2. Crear el proyecto Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** y ejecuta, en orden:
   - `supabase/migrations/202608110001_initial_schema.sql`
   - `supabase/migrations/202608110002_storage.sql`
   - `supabase/migrations/202608110003_invitation_templates.sql`
3. En **Authentication > Users**, crea el usuario `dulce.eduardo@rcminvitaciones.com` con una contraseña segura.
4. Ejecuta `supabase/seed.sql` para crear el evento y los cuatro invitados de prueba.
5. Copia `.env.example` como `.env` y completa:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_ANON
VITE_PUBLIC_SITE_URL=http://localhost:5173
VITE_DEMO_MODE=false
```

La clave `anon` puede usarse en el navegador porque la autorización real está impuesta por RLS. Nunca agregues la clave `service_role` a variables `VITE_*`.

## 3. Seguridad RLS

- **profiles_select/update_own_or_admin:** cada usuario autenticado consulta o edita sólo su propio perfil. `super_admin` puede consultar todos.
- **events_*_owner_or_admin:** un cliente opera únicamente eventos cuyo `client_id` coincide con `auth.uid()`.
- **guests_*_event_owner_or_admin:** el acceso a un invitado exige ser dueño de su evento padre; conocer un UUID no concede acceso.
- **get_public_invitation:** la invitación pública no tiene permisos `SELECT` sobre tablas. Una función controlada valida a la vez el slug, código y relación invitado-evento, y devuelve únicamente datos públicos; no expone teléfono, mesa ni observaciones.
- **event-assets:** el bucket es privado y sólo permite archivos dentro de una carpeta cuyo nombre sea el UUID de un evento propio.

El rol `super_admin` está preparado para RCM Code Dev. Para promover una cuenta desde SQL Editor:

```sql
update public.profiles set rol = 'super_admin'
where email = 'TU_CORREO';
```

## 4. Rutas

- `/` — presentación de RCM Invitaciones.
- `/evento/:eventoSlug/:codigoInvitado` — invitación pública personalizada.
- `/login` — autenticación Supabase.
- `/panel` — dashboard del cliente.
- `/panel/invitados` — CRUD, copiado y WhatsApp.
- `/panel/configuracion` — datos básicos del evento.
- `/admin` — base de la futura administración global.

## Plantillas para múltiples invitaciones

Cada evento guarda un `template_key`. React consulta ese valor y selecciona el diseño desde `src/templates/InvitationTemplateRenderer.jsx`. Dulce & Eduardo utiliza `elegante-clasica`, que recupera el sobre animado, el sello con iniciales y la portada romántica anterior.

El campo `template_config` almacena contenido visual propio de cada evento —fotografías, video, imágenes de ubicaciones, dress code y datos bancarios— sin dejar esos datos fijos dentro de los componentes.

Para añadir otro diseño no es necesario crear otro proyecto: se crea un componente dentro de `src/templates`, se registra su clave en el renderer y se asigna esa clave al evento. El panel permite elegir entre las plantillas registradas.

## 5. Publicar en Netlify

El archivo `netlify.toml` ya configura:

- comando: `npm run build`
- carpeta publicada: `dist`
- redirección SPA para que las rutas personalizadas no produzcan 404

En Netlify agrega `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PUBLIC_SITE_URL` y `VITE_DEMO_MODE=false` en **Environment variables**.

## Comprobaciones

```bash
npm run build
npm run lint
npm test
```

## Preparación para fases siguientes

La separación entre `services`, `hooks`, rutas y componentes permite incorporar después RSVP persistente, importación Excel, QR, control de acceso y álbum. `storageService.js` y el bucket privado dejan preparado el almacenamiento sin exponerlo todavía en la interfaz.
