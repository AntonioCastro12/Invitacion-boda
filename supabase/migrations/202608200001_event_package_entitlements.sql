-- RCM Invitaciones · paquetes comerciales y servicios habilitados por evento.
-- La asignación pertenece a la plataforma; el cliente solamente puede consultarla.
create table public.plans (
  key text primary key,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  gallery_limit integer not null default 1 check (gallery_limit >= 1),
  features jsonb not null default '{}'::jsonb check (jsonb_typeof(features) = 'object'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_entitlements (
  event_id uuid primary key references public.events(id) on delete cascade,
  plan_key text not null references public.plans(key),
  feature_overrides jsonb not null default '{}'::jsonb check (jsonb_typeof(feature_overrides) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index event_entitlements_plan_key_idx on public.event_entitlements(plan_key);

create trigger plans_set_updated_at before update on public.plans
for each row execute function public.set_updated_at();
create trigger event_entitlements_set_updated_at before update on public.event_entitlements
for each row execute function public.set_updated_at();

insert into public.plans (key, name, price, gallery_limit, features) values
('esencial-250', 'Esencial', 250, 1, '{"whatsapp_rsvp":true}'),
('musical-500', 'Musical', 500, 5, '{"music":true,"countdown":true}'),
('elegante-900', 'Elegante', 900, 20, '{"music":true,"countdown":true,"premium_gallery":true,"itinerary":true,"whatsapp_rsvp":true}'),
('premium-1500', 'Premium', 1500, 40, '{"music":true,"countdown":true,"premium_gallery":true,"itinerary":true,"form_rsvp":true,"personalized_passes":true}'),
('premium-plus-2500', 'Premium Plus', 2500, 80, '{"music":true,"countdown":true,"premium_gallery":true,"itinerary":true,"database_rsvp":true,"personalized_passes":true,"individual_qr":true,"admin_panel":true,"statistics":true}'),
('vip-5000', 'VIP', 5000, 200, '{"music":true,"countdown":true,"premium_gallery":true,"itinerary":true,"whatsapp_rsvp":true,"form_rsvp":true,"database_rsvp":true,"personalized_passes":true,"individual_qr":true,"admin_panel":true,"collaborative_album":true,"qr_scanner":true,"access_control":true,"entry_log":true,"statistics":true}')
on conflict (key) do update set
  name = excluded.name,
  price = excluded.price,
  gallery_limit = excluded.gallery_limit,
  features = excluded.features,
  active = true;

insert into public.event_entitlements (event_id, plan_key)
select id, 'elegante-900' from public.events
on conflict (event_id) do nothing;

alter table public.plans enable row level security;
alter table public.event_entitlements enable row level security;

create policy "plans_read_authenticated" on public.plans for select to authenticated
using (true);
create policy "plans_manage_admin" on public.plans for all to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());

create policy "entitlements_read_owner_or_admin" on public.event_entitlements for select to authenticated
using (public.owns_event(event_id) or public.is_super_admin());
create policy "entitlements_insert_admin" on public.event_entitlements for insert to authenticated
with check (public.is_super_admin());
create policy "entitlements_update_admin" on public.event_entitlements for update to authenticated
using (public.is_super_admin()) with check (public.is_super_admin());
create policy "entitlements_delete_admin" on public.event_entitlements for delete to authenticated
using (public.is_super_admin());

revoke all on public.plans, public.event_entitlements from anon, authenticated;
grant select on public.plans to authenticated;
grant select, insert, update, delete on public.event_entitlements to authenticated;

create or replace function public.get_public_invitation(p_event_slug text, p_guest_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'event', jsonb_build_object(
      'id', e.id, 'name', e.name, 'slug', e.slug, 'event_type', e.event_type,
      'event_date', e.event_date, 'event_time', e.event_time,
      'plan', coalesce(p.name, e.plan), 'plan_key', ee.plan_key,
      'package_price', p.price, 'gallery_limit', p.gallery_limit,
      'features', coalesce(p.features, '{}'::jsonb) || coalesce(ee.feature_overrides, '{}'::jsonb),
      'whatsapp', e.whatsapp, 'ceremony_name', e.ceremony_name,
      'ceremony_address', e.ceremony_address, 'ceremony_lat', e.ceremony_lat,
      'ceremony_lng', e.ceremony_lng, 'reception_name', e.reception_name,
      'reception_address', e.reception_address, 'reception_lat', e.reception_lat,
      'reception_lng', e.reception_lng, 'music_url', e.music_url,
      'itinerary', e.itinerary, 'gift_registry', e.gift_registry,
      'template_key', e.template_key, 'template_config', e.template_config
    ),
    'guest', jsonb_build_object('id', g.id, 'name', g.name, 'passes', g.passes, 'code', g.code)
  )
  from public.events e
  join public.guests g on g.event_id = e.id
  left join public.event_entitlements ee on ee.event_id = e.id
  left join public.plans p on p.key = ee.plan_key and p.active
  where e.slug = lower(trim(p_event_slug)) and g.code = upper(trim(p_guest_code))
  limit 1;
$$;

revoke all on function public.get_public_invitation(text, text) from public;
grant execute on function public.get_public_invitation(text, text) to anon, authenticated;
