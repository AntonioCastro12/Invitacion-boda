-- Cada evento elige su diseño sin crear otra aplicación React.
alter table public.events
add column if not exists template_key text not null default 'elegante-clasica';

alter table public.events
add column if not exists template_config jsonb not null default '{}'::jsonb;

create index if not exists events_template_key_idx on public.events(template_key);

create or replace function public.get_public_invitation(p_event_slug text, p_guest_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'event', jsonb_build_object(
      'id', e.id, 'name', e.name, 'slug', e.slug, 'event_type', e.event_type,
      'event_date', e.event_date, 'event_time', e.event_time, 'plan', e.plan,
      'template_key', e.template_key, 'template_config', e.template_config, 'whatsapp', e.whatsapp,
      'ceremony_name', e.ceremony_name, 'ceremony_address', e.ceremony_address,
      'ceremony_lat', e.ceremony_lat, 'ceremony_lng', e.ceremony_lng,
      'reception_name', e.reception_name, 'reception_address', e.reception_address,
      'reception_lat', e.reception_lat, 'reception_lng', e.reception_lng,
      'music_url', e.music_url, 'itinerary', e.itinerary, 'gift_registry', e.gift_registry
    ),
    'guest', jsonb_build_object('id', g.id, 'name', g.name, 'passes', g.passes, 'code', g.code)
  )
  from public.events e join public.guests g on g.event_id = e.id
  where e.slug = lower(trim(p_event_slug)) and g.code = upper(trim(p_guest_code))
  limit 1;
$$;

revoke all on function public.get_public_invitation(text, text) from public;
grant execute on function public.get_public_invitation(text, text) to anon, authenticated;
