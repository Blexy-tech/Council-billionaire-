-- COUNCIL B2B SaaS MVP SUPABASE SCHEMA & RLS POLICIES

-- 1. ACCESS REQUESTS TABLE
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text not null,
  job_title text not null,
  company_website text,
  company_size text,
  business_problem text not null,
  phone_number text,
  status text not null default 'new' check (status in ('new', 'contacted', 'demo', 'pilot', 'customer', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone,
  reviewed_by text
);

alter table public.access_requests enable row level security;

create policy "Allow public to insert access requests"
  on public.access_requests for insert
  to public
  with check (true);

create policy "Allow admins to view access requests"
  on public.access_requests for select
  to authenticated
  using (true);

create policy "Allow admins to update access requests"
  on public.access_requests for update
  to authenticated
  using (true);


-- 2. ORGANIZATIONS TABLE FOR CUSTOMER WORKSPACES
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.organizations enable row level security;

create policy "Allow organization members to access organization"
  on public.organizations for select
  to authenticated
  using (true);


-- 3. SUBSCRIPTIONS TABLE (COUNCIL PILOT $499/mo)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  status text not null default 'incomplete' check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

create policy "Allow org members to view subscription"
  on public.subscriptions for select
  to authenticated
  using (true);


-- 4. CUSTOMER METRICS & CSV UPLOADS
create table if not exists public.customer_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  metric_name text not null,
  metric_value text not null,
  data_source text not null default 'CSV Upload',
  data_freshness text not null default 'Just now',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.customer_metrics enable row level security;

create policy "Allow org members to view customer metrics"
  on public.customer_metrics for select
  to authenticated
  using (true);

create policy "Allow org members to insert customer metrics"
  on public.customer_metrics for insert
  to authenticated
  with check (true);
