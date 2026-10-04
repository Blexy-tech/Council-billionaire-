-- COUNCIL SUPABASE MIGRATION: ACCESS REQUESTS TABLE & RLS POLICIES

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  business_email text not null,
  company text not null,
  job_title text not null,
  website text not null,
  company_size text not null,
  business_problem text not null,
  phone text,
  status text not null default 'NEW',
  created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.access_requests enable row level security;

-- Policy 1: Allow public/anonymous users to INSERT new requests
create policy "Allow public to insert access requests"
  on public.access_requests
  for insert
  to public
  with check (true);

-- Policy 2: Restrict SELECT, UPDATE, DELETE to authenticated admin/service role only
create policy "Restrict access requests read/write to admin only"
  on public.access_requests
  for all
  to authenticated
  using (
    auth.jwt() ->> 'role' = 'service_role' or 
    exists (
      select 1 from public.users 
      where users.id = auth.uid() and users.role = 'SUPER_ADMIN'
    )
  );
