-- Staff rota settings (employees + monthly schedules as JSON)
-- Run in Supabase SQL editor for persistent rota data on production

create table if not exists rota_settings (
  id text primary key default 'default',
  data jsonb not null default '{"employees":[],"monthlySchedules":{}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table rota_settings enable row level security;

drop policy if exists "Allow select rota_settings" on rota_settings;
drop policy if exists "Allow insert rota_settings" on rota_settings;
drop policy if exists "Allow update rota_settings" on rota_settings;

create policy "Allow select rota_settings"
  on rota_settings for select using (true);
create policy "Allow insert rota_settings"
  on rota_settings for insert with check (true);
create policy "Allow update rota_settings"
  on rota_settings for update using (true);

-- Optional: private bucket for right-to-work document uploads
-- Create in Supabase Dashboard → Storage → New bucket: rota-documents (private)
-- Or run (requires storage extension):
-- insert into storage.buckets (id, name, public) values ('rota-documents', 'rota-documents', false) on conflict do nothing;
