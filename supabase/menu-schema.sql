-- Menu management — run after setup-complete.sql

create table if not exists menu_settings (
  id text primary key default 'default',
  lunch_note text not null default 'Mon – Fri, 11:45am – 4:00pm',
  data jsonb not null default '{"daily":[],"lunch":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table menu_settings enable row level security;

drop policy if exists "Allow select menu" on menu_settings;
drop policy if exists "Allow upsert menu" on menu_settings;

create policy "Allow select menu"
  on menu_settings for select using (true);

create policy "Allow upsert menu"
  on menu_settings for insert with check (true);

create policy "Allow update menu"
  on menu_settings for update using (true);
