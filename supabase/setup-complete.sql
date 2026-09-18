-- Pho Ta — run this entire file once in Supabase SQL Editor
-- Dashboard → SQL → New query → paste → Run

create type seating_preference as enum (
  'side', 'centre', 'near_window', 'quiet', 'no_preference'
);

create type booking_status as enum (
  'confirmed', 'seated', 'completed', 'cancelled', 'no_show'
);

create type booking_source as enum ('website', 'phone', 'walk_in');

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  location_slug text not null,
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  booking_date date not null,
  booking_time time not null,
  party_size integer not null check (party_size between 1 and 20),
  seating_preference seating_preference not null default 'no_preference',
  special_requests text,
  status booking_status not null default 'confirmed',
  source booking_source not null default 'website',
  reminder_sent_at timestamptz,
  confirmation_sent_at timestamptz,
  seated_at_table text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blackout_dates (
  id uuid primary key default gen_random_uuid(),
  location_slug text,
  blackout_date date not null,
  reason text
);

create index if not exists bookings_date_location_idx
  on bookings (location_slug, booking_date, booking_time);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists customers_email_idx on customers (email);
create index if not exists customers_phone_idx on customers (phone);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists bookings_updated_at on bookings;
create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- RLS policies (required when using publishable key)
alter table customers enable row level security;
alter table bookings enable row level security;

drop policy if exists "Allow insert customers" on customers;
drop policy if exists "Allow select customers" on customers;
drop policy if exists "Allow insert bookings" on bookings;
drop policy if exists "Allow select bookings" on bookings;
drop policy if exists "Allow update bookings" on bookings;

create policy "Allow insert customers"
  on customers for insert with check (true);
create policy "Allow select customers"
  on customers for select using (true);
create policy "Allow insert bookings"
  on bookings for insert with check (true);
create policy "Allow select bookings"
  on bookings for select using (true);
create policy "Allow update bookings"
  on bookings for update using (true);
create policy "Allow update customers"
  on customers for update using (true);

alter table blackout_dates enable row level security;

drop policy if exists "Allow select blackouts" on blackout_dates;
drop policy if exists "Allow insert blackouts" on blackout_dates;
drop policy if exists "Allow delete blackouts" on blackout_dates;

create policy "Allow select blackouts"
  on blackout_dates for select using (true);
create policy "Allow insert blackouts"
  on blackout_dates for insert with check (true);
create policy "Allow delete blackouts"
  on blackout_dates for delete using (true);

-- Menu (JSON snapshot for admin CRUD)
create table if not exists menu_settings (
  id text primary key default 'default',
  lunch_note text not null default 'Mon – Fri, 11:45am – 4:00pm',
  data jsonb not null default '{"daily":[],"lunch":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table menu_settings enable row level security;

drop policy if exists "Allow select menu" on menu_settings;
drop policy if exists "Allow insert menu" on menu_settings;
drop policy if exists "Allow update menu" on menu_settings;

create policy "Allow select menu"
  on menu_settings for select using (true);
create policy "Allow insert menu"
  on menu_settings for insert with check (true);
create policy "Allow update menu"
  on menu_settings for update using (true);

-- Site settings (hours, capacity, slots — admin overrides)
create table if not exists site_settings (
  id text primary key default 'default',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

drop policy if exists "Allow select site_settings" on site_settings;
drop policy if exists "Allow insert site_settings" on site_settings;
drop policy if exists "Allow update site_settings" on site_settings;

create policy "Allow select site_settings"
  on site_settings for select using (true);
create policy "Allow insert site_settings"
  on site_settings for insert with check (true);
create policy "Allow update site_settings"
  on site_settings for update using (true);

-- Staff rota (saved employees + monthly team schedules)
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

-- Notification delivery log
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  reference_code text,
  channel text not null,
  type text not null,
  recipient text not null,
  status text not null,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists notification_log_created_idx
  on notification_log (created_at desc);

alter table notification_log enable row level security;

drop policy if exists "Allow select notification_log" on notification_log;
drop policy if exists "Allow insert notification_log" on notification_log;

create policy "Allow select notification_log"
  on notification_log for select using (true);
create policy "Allow insert notification_log"
  on notification_log for insert with check (true);
