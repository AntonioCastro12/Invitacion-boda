-- RCM Invitaciones · Esquema multi-evento de la Fase 1
create extension if not exists pgcrypto;

create type public.user_role as enum ('super_admin', 'cliente');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null,
  rol public.user_role not null default 'cliente',
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  event_type text not null,
  event_date date not null,
  event_time time not null,
  plan text not null default 'elegante',
  price_reference numeric(10,2),
  whatsapp text not null,
  ceremony_name text,
  ceremony_address text,
  ceremony_lat double precision,
  ceremony_lng double precision,
  reception_name text,
  reception_address text,
  reception_lat double precision,
  reception_lng double precision,
  music_url text,
  itinerary jsonb not null default '[]'::jsonb,
  gift_registry jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  phone text,
  passes integer not null check (passes >= 1),
  code text not null unique check (code = upper(code) and length(code) between 5 and 16),
  table_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_client_id_idx on public.events(client_id);
create index guests_event_id_idx on public.guests(event_id);
create index guests_event_code_idx on public.guests(event_id, code);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();
create trigger guests_set_updated_at before update on public.guests
for each row execute function public.set_updated_at();

-- Crea automáticamente el perfil cuando se registra un usuario en Supabase Auth.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email,
    'cliente'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Funciones internas de autorización. SECURITY DEFINER evita recursión en RLS.
create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and rol = 'super_admin');
$$;

create or replace function public.owns_event(target_event_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.events where id = target_event_id and client_id = auth.uid());
$$;

revoke all on function public.is_super_admin() from public;
revoke all on function public.owns_event(uuid) from public;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.owns_event(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.guests enable row level security;

-- PROFILES: cada cliente ve/edita sólo su perfil; super_admin puede ver todos.
create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_super_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated
using (id = auth.uid() or public.is_super_admin())
with check (id = auth.uid() or public.is_super_admin());

-- EVENTS: el cliente sólo opera eventos cuyo client_id coincide con auth.uid().
create policy "events_select_owner_or_admin" on public.events for select to authenticated
using (client_id = auth.uid() or public.is_super_admin());
create policy "events_insert_owner_or_admin" on public.events for insert to authenticated
with check (client_id = auth.uid() or public.is_super_admin());
create policy "events_update_owner_or_admin" on public.events for update to authenticated
using (client_id = auth.uid() or public.is_super_admin())
with check (client_id = auth.uid() or public.is_super_admin());
create policy "events_delete_owner_or_admin" on public.events for delete to authenticated
using (client_id = auth.uid() or public.is_super_admin());

-- GUESTS: el acceso depende de ser dueño del evento padre; nunca basta conocer un event_id.
create policy "guests_select_event_owner_or_admin" on public.guests for select to authenticated
using (public.owns_event(event_id) or public.is_super_admin());
create policy "guests_insert_event_owner_or_admin" on public.guests for insert to authenticated
with check (public.owns_event(event_id) or public.is_super_admin());
create policy "guests_update_event_owner_or_admin" on public.guests for update to authenticated
using (public.owns_event(event_id) or public.is_super_admin())
with check (public.owns_event(event_id) or public.is_super_admin());
create policy "guests_delete_event_owner_or_admin" on public.guests for delete to authenticated
using (public.owns_event(event_id) or public.is_super_admin());

-- La invitación pública NO obtiene acceso directo a las tablas. Esta función devuelve
-- únicamente los campos necesarios y valida slug + código + pertenencia en una sola consulta.
create or replace function public.get_public_invitation(p_event_slug text, p_guest_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'event', jsonb_build_object(
      'id', e.id, 'name', e.name, 'slug', e.slug, 'event_type', e.event_type,
      'event_date', e.event_date, 'event_time', e.event_time, 'plan', e.plan,
      'whatsapp', e.whatsapp, 'ceremony_name', e.ceremony_name,
      'ceremony_address', e.ceremony_address, 'ceremony_lat', e.ceremony_lat,
      'ceremony_lng', e.ceremony_lng, 'reception_name', e.reception_name,
      'reception_address', e.reception_address, 'reception_lat', e.reception_lat,
      'reception_lng', e.reception_lng, 'music_url', e.music_url,
      'itinerary', e.itinerary, 'gift_registry', e.gift_registry
    ),
    'guest', jsonb_build_object('id', g.id, 'name', g.name, 'passes', g.passes, 'code', g.code)
  )
  from public.events e
  join public.guests g on g.event_id = e.id
  where e.slug = lower(trim(p_event_slug)) and g.code = upper(trim(p_guest_code))
  limit 1;
$$;

revoke all on function public.get_public_invitation(text, text) from public;
grant execute on function public.get_public_invitation(text, text) to anon, authenticated;

revoke all on public.profiles, public.events, public.guests from anon;
grant select, insert, update, delete on public.profiles, public.events, public.guests to authenticated;
