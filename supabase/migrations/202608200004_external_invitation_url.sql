-- Permite que RCM diseñe y publique la invitación fuera del panel y la asigne al evento.
alter table public.events
add column if not exists invitation_url text;

alter table public.events
add constraint events_invitation_url_http_check
check (invitation_url is null or invitation_url ~ '^https?://');

comment on column public.events.invitation_url is
'URL pública del diseño entregado por RCM. El cliente puede abrirla, pero no modificarla desde su panel.';
