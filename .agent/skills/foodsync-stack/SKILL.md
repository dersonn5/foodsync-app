---
name: foodsync-stack
description: Padrões de código obrigatórios para o projeto FoodSync (Next.js, Tailwind, Lucide). Use ao criar ou editar páginas e componentes.
---

# Padrões FoodSync

## Tecnologias
- **Framework:** Next.js 15+ (App Router).
- **Estilo:** Tailwind CSS.
- **Ícones:** Lucide React.
- **Data Fetching:** @supabase/ssr.

## Regras de Ouro
1. **Server vs Client:**
   - Por padrão, tente usar Server Components.
   - Se precisar de `useState`, `useEffect` ou interatividade, adicione `'use client'` no topo.
2. **Importações:**
   - Use `@/components/...` para importar componentes.
   - Nunca use bibliotecas pesadas se uma função nativa resolver.
3. **UI/UX:**
   - Botões devem ter feedback visual (`active:scale-95`).
   - Use o componente `Sonner` ou `Toast` para feedback de erro/sucesso.