---
description: Workflow obrigatório para seleção de skills antes de executar qualquer tarefa
---

# 🎯 Skill Selection Workflow

## Passo Obrigatório Antes de Qualquer Tarefa

Este workflow deve ser executado **ANTES** de iniciar qualquer tarefa solicitada pelo usuário.

---

## 1. Análise da Solicitação

Identifique as palavras-chave e o contexto da solicitação:

- **Frontend/UI**: `frontend-design`, `mobile-design`, `tailwind-patterns`, `web-design-guidelines`
- **Backend/API**: `api-patterns`, `nodejs-best-practices`, `database-design`
- **Next.js/React**: `nextjs-react-expert`
- **Código Limpo**: `clean-code`, `code-review-checklist`
- **Testes**: `testing-patterns`, `webapp-testing`, `tdd-workflow`
- **Debugging**: `systematic-debugging`
- **Performance**: `performance-profiling`
- **Segurança**: `vulnerability-scanner`, `red-team-tactics`
- **Arquitetura**: `architecture`, `app-builder`
- **Deploy**: `deployment-procedures`, `server-management`
- **Documentação**: `documentation-templates`
- **Planejamento**: `plan-writing`, `brainstorming`

---

## 2. Seleção de Skills

// turbo
Leia o SKILL.md da(s) skill(s) mais relevante(s):

```
view_file .agent/skills/[nome-da-skill]/SKILL.md
```

### Skills Prioritárias para FoodSync:

| Contexto | Skill Principal | Skills Complementares |
|----------|-----------------|----------------------|
| Componentes React | `nextjs-react-expert` | `frontend-design`, `clean-code` |
| Estilização | `tailwind-patterns` | `frontend-design`, `mobile-design` |
| API/Backend | `api-patterns` | `nodejs-best-practices`, `database-design` |
| Banco de Dados | `database-design` | `api-patterns` |
| Bugs/Erros | `systematic-debugging` | `clean-code` |
| UI/UX Design | `frontend-design` | `web-design-guidelines`, `mobile-design` |
| Testes | `webapp-testing` | `testing-patterns` |
| Nova Feature | `brainstorming` | `plan-writing`, `architecture` |
| Revisão de Código | `code-review-checklist` | `clean-code` |

---

## 3. Aplicar Diretrizes

Após ler a skill, aplique suas diretrizes durante toda a execução da tarefa.

---

## 4. Documentar no Plano

Se criar um `implementation_plan.md`, mencione quais skills foram consultadas.

---

## Exemplo de Uso

**Solicitação**: "Preciso criar um novo componente de modal para feedback"

**Skills Selecionadas**:
1. `nextjs-react-expert` - Para padrões React/Next.js
2. `frontend-design` - Para design do modal
3. `clean-code` - Para código limpo e manutenível
