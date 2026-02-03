-- =====================================================
-- FEEDBACKS_APP TABLE - FoodSync Meal Feedback System
-- =====================================================
-- Run this migration on your Supabase project to enable
-- the feedback collection feature.

-- Create the feedbacks_app table
create table if not exists public.feedbacks_app (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    funcionario_id uuid references public.users(id) on delete cascade not null,
    unidade_cozinha text not null default 'Cozinha Principal',
    nota integer not null check (nota >= 1 and nota <= 5),
    comentario text,
    data_refeicao date not null,
    
    -- Prevent duplicate feedback per user per day
    unique(funcionario_id, data_refeicao)
);

-- Enable Row Level Security
alter table public.feedbacks_app enable row level security;

-- Policies for MVP (allow all operations - adjust for production)
create policy "Enable read access for all users" on public.feedbacks_app for select using (true);
create policy "Enable insert for all users" on public.feedbacks_app for insert with check (true);
create policy "Enable update for own feedback" on public.feedbacks_app for update using (true);

-- Create index for common queries
create index if not exists feedbacks_app_data_refeicao_idx on public.feedbacks_app(data_refeicao);
create index if not exists feedbacks_app_unidade_idx on public.feedbacks_app(unidade_cozinha);

-- Comment for documentation
comment on table public.feedbacks_app is 'Stores meal feedback from employees with ratings 1-5 and optional comments';
