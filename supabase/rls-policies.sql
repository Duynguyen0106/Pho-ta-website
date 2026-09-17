-- Run AFTER schema.sql when using the publishable (anon) key on the server.
-- The service role key bypasses RLS and does not need these policies.

alter table customers enable row level security;
alter table bookings enable row level security;

create policy "Allow insert customers"
  on customers for insert
  with check (true);

create policy "Allow select customers"
  on customers for select
  using (true);

create policy "Allow insert bookings"
  on bookings for insert
  with check (true);

create policy "Allow select bookings"
  on bookings for select
  using (true);

create policy "Allow update bookings"
  on bookings for update
  using (true);
