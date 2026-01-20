-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  cpf text not null unique,
  role text not null check (role in ('employee', 'kitchen_staff')) default 'employee'
);

-- MENU ITEMS TABLE
create table public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  type text not null check (type in ('main', 'fit', 'snack')),
  photo_url text
);

-- DAILY MENUS TABLE
create table public.daily_menus (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  is_active boolean default true,
  unique(date)
);

-- DAILY MENU ITEMS JOIN TABLE (Implicitly needed to link menu_items to daily_menus, though not explicitly asked, it is best practice. 
-- However, the user asked for: "3. daily_menus: ... (Relaciona quais menu_items estarão disponíveis em qual data)". 
-- A simple way is to have a many-to-many relationship or a foreign key. 
-- Given the requirement "Relaciona quais menu_items estarão disponíveis", I'll add a join table `daily_menu_items` to be robust, 
-- OR strictly follow the prompt if it implies `daily_menus` directly contains items? 
-- The prompt says "Relaciona quais menu_items...". A separate table is cleaner.
-- But to keep it simple as per "MVP", maybe I can add `daily_menu_id` to `menu_items`? No, items can be reused.
-- I will create a `daily_menu_items` table to link them.)

create table public.daily_menu_items (
  id uuid default uuid_generate_v4() primary key,
  daily_menu_id uuid references public.daily_menus(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) on delete cascade not null,
  unique(daily_menu_id, menu_item_id)
);

-- ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.users(id) not null,
  menu_item_id uuid references public.menu_items(id) not null,
  consumption_date date not null,
  status text not null check (status in ('pending', 'consumed', 'missed')) default 'pending'
);

-- ROW LEVEL SECURITY (RLS)
alter table public.users enable row level security;
alter table public.menu_items enable row level security;
alter table public.daily_menus enable row level security;
alter table public.daily_menu_items enable row level security;
alter table public.orders enable row level security;

-- POLICIES (Basic for MVP)

-- Users: Read public, Write self (or admin/staff - simplified here to public read for auth check)
create policy "Enable read access for all users" on public.users for select using (true);
create policy "Enable insert for all users" on public.users for insert with check (true);

-- Menu Items: Read public, Write staff only (simplified to public read)
create policy "Enable read access for all users" on public.menu_items for select using (true);

-- Daily Menus: Read public
create policy "Enable read access for all users" on public.daily_menus for select using (true);
create policy "Enable read access for all users" on public.daily_menu_items for select using (true);

-- Orders: Read/Insert own orders
-- Since we are mocking auth and looking up by CPF, we might need looser policies or rely on the backend/functions.
-- For true RLS, we'd need Supabase Auth `auth.uid()`. 
-- As requested "Mockar a auth -> salva no contexto", the client will likely query directly.
-- We'll allow public insert/select for this MVP demo to avoid 'permission denied' during the mock auth phase.
create policy "Enable read access for all users" on public.orders for select using (true);
create policy "Enable insert for all users" on public.orders for insert with check (true);
create policy "Enable update for all users" on public.orders for update using (true);

-- ADMINS TABLE (For enhanced security)
create table public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Admins
alter table public.admins enable row level security;
create policy "Allow read access for all" on public.admins for select using (true);

-- Grant permissions (Required for Auth Helpers to check role)
grant select on table public.admins to authenticated;

