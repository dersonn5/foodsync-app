---
name: supabase-db
description: Regras para criar tabelas, funções SQL e políticas RLS no Supabase. Use ao modificar o banco de dados.
---

# Supabase Workflow

## Criar Tabelas
- Sempre use UUID como chave primária (`id uuid default gen_random_uuid()`).
- Use `timestamptz` para datas (`created_at`).
- Adicione comentários nas colunas importantes.

## Funções (RPC)
- Se a lógica for complexa (ex: vincular usuário ao CPF), crie uma função `plpgsql` e chame via `.rpc()`.
- Lembre de dar permissão: `grant execute on function nome_da_funcao to authenticated, anon;`.

## RLS (Segurança)
- **NUNCA** deixe uma tabela sem RLS (`alter table x enable row level security;`).
- Crie policies separadas para `select`, `insert`, `update`.