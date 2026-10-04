-- COUNCIL 2-TIER PRICING MIGRATION: ADD TIER & ENTERPRISE FIELDS

do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='access_requests' and column_name='tier') then
    alter table public.access_requests add column tier text not null default 'starter';
  end if;

  if not exists (select 1 from information_schema.columns where table_name='access_requests' and column_name='payment_code') then
    alter table public.access_requests add column payment_code text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='access_requests' and column_name='company_valuation') then
    alter table public.access_requests add column company_valuation text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='access_requests' and column_name='net_worth') then
    alter table public.access_requests add column net_worth text;
  end if;
end $$;
