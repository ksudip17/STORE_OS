-- ============================================================================
-- StoreOS — Database Schema
-- Apply this in the Supabase SQL editor. It creates tables, enables Row Level
-- Security (the backbone of multi-tenancy), and installs the balance trigger.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES — mirrors auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  username    text unique,
  avatar_url  text,
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. STORES
-- ---------------------------------------------------------------------------
create table if not exists public.stores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        text not null check (type in ('Retail', 'Wholesale', 'Online', 'Service')),
  description text,
  created_at  timestamptz default now()
);

alter table public.stores enable row level security;

drop policy if exists "Users can view own stores" on public.stores;
create policy "Users can view own stores"
  on public.stores for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own stores" on public.stores;
create policy "Users can insert own stores"
  on public.stores for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own stores" on public.stores;
create policy "Users can update own stores"
  on public.stores for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own stores" on public.stores;
create policy "Users can delete own stores"
  on public.stores for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. CUSTOMERS
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references public.stores(id) on delete cascade,
  name       text not null,
  phone      text,
  address    text,
  -- Positive = advance (customer paid ahead), Negative = due (owes you)
  balance    numeric(14, 2) not null default 0,
  created_at timestamptz default now()
);

alter table public.customers enable row level security;

-- RLS for customers resolves ownership through the parent store.
drop policy if exists "Users can view customers in own stores" on public.customers;
create policy "Users can view customers in own stores"
  on public.customers for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = customers.store_id
        and stores.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert customers in own stores" on public.customers;
create policy "Users can insert customers in own stores"
  on public.customers for insert
  with check (
    exists (
      select 1 from public.stores
      where stores.id = customers.store_id
        and stores.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update customers in own stores" on public.customers;
create policy "Users can update customers in own stores"
  on public.customers for update
  using (
    exists (
      select 1 from public.stores
      where stores.id = customers.store_id
        and stores.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete customers in own stores" on public.customers;
create policy "Users can delete customers in own stores"
  on public.customers for delete
  using (
    exists (
      select 1 from public.stores
      where stores.id = customers.store_id
        and stores.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. TRANSACTIONS
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type        text not null check (type in ('sale', 'payment')),
  amount      numeric(14, 2) not null check (amount > 0),
  description text,
  product     text,
  quantity    numeric(14, 2),
  rate        numeric(14, 2),
  date        timestamptz not null default now()
);

alter table public.transactions enable row level security;

drop policy if exists "Users can view transactions in own stores" on public.transactions;
create policy "Users can view transactions in own stores"
  on public.transactions for select
  using (
    exists (
      select 1 from public.customers
      join public.stores on stores.id = customers.store_id
      where customers.id = transactions.customer_id
        and stores.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert transactions in own stores" on public.transactions;
create policy "Users can insert transactions in own stores"
  on public.transactions for insert
  with check (
    exists (
      select 1 from public.customers
      join public.stores on stores.id = customers.store_id
      where customers.id = transactions.customer_id
        and stores.user_id = auth.uid()
    )
  );

-- Balance updates are handled exclusively by the DB trigger below, so users
-- cannot directly UPDATE/DELETE transactions (prevents tampering).
drop policy if exists "Users can update transactions in own stores" on public.transactions;
create policy "Users can update transactions in own stores"
  on public.transactions for update
  using (false);

drop policy if exists "Users can delete transactions in own stores" on public.transactions;
create policy "Users can delete transactions in own stores"
  on public.transactions for delete
  using (false);

-- ---------------------------------------------------------------------------
-- 5. BALANCE TRIGGER
-- A sale increases the customer's due (balance -= amount).
-- A payment decreases it (balance += amount). The client never writes balance.
-- ---------------------------------------------------------------------------
create or replace function public.update_customer_balance()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    if (new.type = 'sale') then
      update public.customers
        set balance = balance - new.amount
        where id = new.customer_id;
    elsif (new.type = 'payment') then
      update public.customers
        set balance = balance + new.amount
        where id = new.customer_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_transaction_balance on public.transactions;
create trigger on_transaction_balance
  after insert on public.transactions
  for each row execute procedure public.update_customer_balance();

-- ---------------------------------------------------------------------------
-- 6. INDEXES — keep lookups fast
-- ---------------------------------------------------------------------------
create index if not exists idx_customers_store_id     on public.customers(store_id);
create index if not exists idx_transactions_customer  on public.transactions(customer_id);
create index if not exists idx_transactions_date      on public.transactions(date);
