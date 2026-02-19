---
name: n8n-integration
description: Formato de dados para webhooks do n8n e comunicação com Evolution API. Use ao criar fluxos de notificação.
---

# Integração n8n (WhatsApp)

## Webhooks
- O n8n espera payloads JSON simples.
- URL Base: `https://n8n.automaxio.com.br/...` (ou a URL atual).

## Formatação de Telefone
- O banco salva números puros (ex: `11999998888`).
- A Evolution API exige o formato `5511999998888`.
- **Regra:** Sempre adicione `55` antes de enviar para a API, e remova o `55` ao receber do webhook antes de buscar no banco.

## Mensagens
- Use Markdown simples para o WhatsApp:
  - `*Negrito*` para destaque.
  - `\n` para quebra de linha.