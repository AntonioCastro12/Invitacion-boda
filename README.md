# RCM Invitaciones

Plataforma React multi-evento para invitaciones digitales personalizadas. La Fase 1 incluye invitación pública, autenticación con Supabase, dashboard privado, CRUD de invitados, enlaces únicos y confirmación por WhatsApp.

## 1. Ejecutar la demostración

```bash
npm install
copy .env.example .env
npm run dev
```

Con `VITE_DEMO_MODE=true`, la aplicación carga la demostración local aunque también existan credenciales de Supabase. El paquete, los extras y las credenciales del cliente se guardan localmente en el navegador para realizar pruebas. Con `VITE_DEMO_MODE=false`, el acceso utiliza únicamente los usuarios reales creados en Supabase.

- Sitio: `http://localhost:5173`
- Invitación de muestra: `http://localhost:5173/evento/dulce-eduardo/A7X92`
- Login: `http://localhost:5173/login`
- Administrador RCM: `admin@rcminvitaciones.com` / `admin2026`
- Cliente: `demo@rcminvitaciones.com` / `demostracion`
- Cliente XV años: `valentina@rcminvitaciones.com` / `valentina2026`

Desde `/admin` se puede cambiar entre los seis paquetes, activar servicios adicionales y modificar el acceso local del cliente. La invitación y el panel reaccionan a esa configuración sin cambiar el diseño personalizado.

## 2. Crear el proyecto Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** y ejecuta, en orden:
   - `supabase/migrations/202608110001_initial_schema.sql`
   - `supabase/migrations/202608110002_storage.sql`
   - `supabase/migrations/202608110003_invitation_templates.sql`
   - `supabase/migrations/202608190001_shared_event_album.sql`
   - `supabase/migrations/202608200001_event_package_entitlements.sql`
   - `supabase/migrations/202608200002_private_album_and_rsvp.sql`
   - `supabase/migrations/202608200003_check_ins.sql`
   - `supabase/migrations/202608200004_external_invitation_url.sql`
   - `supabase/migrations/202608200005_package_catalog_pdf.sql`
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
- **rsvps_owner_*:** el cliente consulta únicamente las respuestas de invitados pertenecientes a su evento.
- **check_ins_owner_*:** el historial de acceso sólo puede verlo o corregirlo el propietario del evento o RCM. Las entradas nuevas pasan por `register_check_in`, que valida usuario, paquete, código, cupo y duplicados.

El rol `super_admin` está preparado para RCM Code Dev. Para promover una cuenta desde SQL Editor:

```sql
update public.profiles set rol = 'super_admin'
where email = 'TU_CORREO';
```

## 4. Rutas

- `/` — presentación de RCM Invitaciones.
- `/evento/:eventoSlug/:codigoInvitado` — invitación pública personalizada.
- `/album/:eventoSlug/:codigoInvitado` — álbum digital local abierto desde botón o QR.
- `/login` — autenticación Supabase.
- `/panel` — dashboard del cliente.
- `/panel/invitados` — CRUD, copiado y WhatsApp.
- `/panel/confirmaciones` — confirmados, pendientes, asistentes y mensajes.
- `/panel/album` — consulta y moderación del álbum privado.
- `/panel/acceso` — lector QR, validación manual y registro de entradas VIP.
- `/panel/estadisticas` — métricas, actividad reciente y reporte CSV.
- `/panel/configuracion` — datos básicos del evento.
- `/admin` — administración local de paquete, extras y acceso del cliente.

### Entregar un diseño mediante enlace

RCM puede construir y publicar cada invitación como un sitio independiente. En **Registrar y asignar invitación**, el superadministrador captura el evento, los datos de acceso del cliente, el paquete y la URL pública final. Si la URL está presente, el proyecto queda marcado como **Liberado** y el botón **Ver invitación** del cliente abre ese sitio; si está vacía, permanece **En diseño**.

Para modificar cualquier evento, pulsa **Administrar** dentro de su tarjeta. El encabezado y las secciones de paquete, servicios y acceso cambian al proyecto seleccionado; los cambios se guardan sólo en ese evento.

La demostración incluye `https://prueba-invitacionxv.netlify.app/` como evento de Valentina Isabella. La URL solamente acepta protocolos HTTP/HTTPS y, en Supabase, se guarda en `events.invitation_url`. Las funciones de panel continúan separadas por el `event_id` asignado al cliente.

## Diseños personalizados para múltiples invitaciones

Cada evento guarda internamente un `template_key`, pero el cliente no selecciona una plantilla. RCM Code Dev crea y asigna el diseño personalizado. Dulce & Eduardo utiliza `elegante-clasica`, con sobre animado, sello con iniciales y portada romántica.

El campo `template_config` almacena contenido visual propio de cada evento —fotografías, video, imágenes de ubicaciones, dress code y datos bancarios— sin dejar esos datos fijos dentro de los componentes.

### Álbum compartido

Con Supabase configurado, el álbum usa el bucket privado `event-albums` y la tabla `album_photos`. Todos los invitados con un enlace válido del mismo evento ven el mismo feed y pueden publicar imágenes de hasta 10 MB. No existe un límite de cantidad impuesto por la aplicación; el límite real depende del almacenamiento contratado. La invitación muestra las cuatro publicaciones más recientes junto al QR.

La función `supabase/functions/album-access` valida el slug y código individual antes de crear URLs firmadas con diez minutos de vigencia. Debe desplegarse como función pública controlada (`--no-verify-jwt`) porque los invitados no tienen una cuenta de Supabase. Sin Supabase, el proyecto conserva una demostración aislada por evento con IndexedDB; las subidas locales sólo aparecen en el navegador que las guardó.

Para añadir otro diseño no es necesario crear otro proyecto: RCM crea un componente dentro de `src/templates`, registra su clave y lo asigna al evento. El cliente únicamente administra los servicios permitidos por su paquete.

## 5. Publicar en Netlify

El archivo `netlify.toml` ya configura:

- comando: `npm run build`
- carpeta publicada: `dist`
- redirección SPA para que las rutas personalizadas no produzcan 404

En Netlify agrega `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PUBLIC_SITE_URL` y `VITE_DEMO_MODE` en **Environment variables**. Usa `VITE_DEMO_MODE=true` para publicar una muestra con los accesos visibles en `/login`; usa `VITE_DEMO_MODE=false` para la versión real conectada a los usuarios de Supabase.

## Comprobaciones

```bash
npm run build
npm run lint
npm test
```

## Operación del paquete VIP

Para probar todas las funciones en modo local, entra como administrador RCM, asigna el paquete **VIP** al evento y luego inicia sesión como cliente. En **Control de acceso** puedes pegar un código o el enlace completo de una invitación; en un navegador compatible también puedes leer el QR con la cámara tras conceder permiso. El sistema evita registrar dos veces a la misma familia y permite corregir una entrada desde el historial.

El módulo **Estadísticas** une invitados, confirmaciones de asistencia y accesos: muestra pases asignados, asistentes confirmados, personas que ingresaron, avance de respuestas y actividad reciente. El reporte CSV puede abrirse en Excel e incluye un tratamiento básico contra fórmulas inyectadas desde campos de texto.

## Preparación para fases siguientes

La arquitectura multi-evento ya separa invitaciones, confirmaciones de asistencia, álbumes y entradas por `event_id`. Las ampliaciones naturales siguientes son importación desde Excel, moderación avanzada, notificaciones, bitácora administrativa, recuperación de contraseña y dominio personalizado por cliente.
