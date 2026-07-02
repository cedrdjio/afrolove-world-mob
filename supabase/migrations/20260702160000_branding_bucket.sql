-- Public bucket for brand assets (logo, email images). Referenced by the
-- auth email templates via its public URL; the logo file itself is uploaded
-- manually (or later via the dashboard). Writes stay admin-only.
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;
