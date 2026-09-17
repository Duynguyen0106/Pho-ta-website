-- Pho Ta Restaurant Booking Schema
-- Run this in your Supabase SQL editor

create type seating_preference as enum (
  'side', 'centre', 'near_window', 'quiet', 'no_preference'
);

create type booking_status as enum (
  'confirmed', 'seated', 'completed', 'cancelled', 'no_show'
);

create type booking_source as enum ('website', 'phone', 'walk_in');

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table bookings (
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

create table blackout_dates (
  id uuid primary key default gen_random_uuid(),
  location_slug text,
  blackout_date date not null,
  reason text
);

create index bookings_date_location_idx on bookings (location_slug, booking_date, booking_time);
create index bookings_status_idx on bookings (status);
create index customers_email_idx on customers (email);
create index customers_phone_idx on customers (phone);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();
