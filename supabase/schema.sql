-- Supabase schema placeholder
create table if not exists access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now()
);
