-- Staff rota tables (run after schema.sql)

create table if not exists rota_employees (
  id uuid primary key,
  name text not null,
  employment_type text not null check (employment_type in ('part_time', 'full_time')),
  requested_hours_per_week numeric(4, 1) not null,
  download_token text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists rota_shifts (
  id text primary key,
  employee_id uuid not null references rota_employees(id) on delete cascade,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  month_key text not null
);

create index if not exists rota_shifts_month_idx on rota_shifts (month_key, shift_date);
