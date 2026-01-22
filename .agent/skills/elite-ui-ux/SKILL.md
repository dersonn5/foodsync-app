---
name: elite-ui-ux
description: Padrões de Design System de alta fidelidade. Use SEMPRE que for gerar interfaces, componentes ou estilos CSS. Foca em aparência Premium, Mobile-First e Acessibilidade.
---

# Elite UI/UX Design System (FoodSync Edition)

Para alcançar uma estética de "Produto de 1 Milhão de Dólares", siga estritamente estas diretrizes visuais em todas as views.

## 1. Filosofia Visual (Clean & Premium)
- **Minimalismo:** Menos bordas, mais espaço em branco (Whitespace). Use `gap-4` a `gap-6` generosamente.
- **Profundidade:** Evite bordas pretas sólidas (`border-black`). Use sombras suaves e bordas sutis (`border-gray-100` ou `shadow-sm`).
- **Glassmorphism Sutil:** Em elementos flutuantes (headers, sticky navs), use `bg-white/80 backdrop-blur-md`.

## 2. Regras de Componentes (Tailwind CSS)

### Botões & Ações
Botões devem parecer "clicáveis" e ter feedback tátil imediato.
- **Padrão Primary:** `bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-sm transition-all active:scale-95`.
- **Padrão Ghost:** `bg-transparent hover:bg-gray-50 text-gray-700 rounded-xl`.
- **Regra de Ouro:** Adicione `active:scale-95` em TODOS os elementos interativos para simular a física de um app nativo.

### Cards & Containers
Não use sombras pesadas. O conteúdo deve "flutuar".
- **Estilo:** `bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]`.
- **Hover (Desktop):** `hover:shadow-md transition-shadow duration-300`.

### Tipografia (Hierarquia Clara)
Nunca deixe o usuário confuso sobre o que é título e o que é texto.
- **Títulos:** `font-bold tracking-tight text-gray-900`.
- **Subtítulos:** `text-sm font-medium text-gray-500 uppercase tracking-wider`.
- **Corpo:** `text-gray-600 leading-relaxed`.

### Inputs & Formulários
Devem ser grandes e amigáveis ao toque (Fat Finger rule).
- **Altura:** Mínimo `h-12` (48px) para mobile.
- **Estilo:** `bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-xl transition-all`.

## 3. Micro-interações & Motion
Nada deve "piscar" na tela. Tudo deve transicionar.
- Use `framer-motion` para entrada de elementos (`initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}`).
- Use `animate-pulse` ou Skeletons (`bg-gray-200 rounded`) em vez de spinners simples durante carregamento.

## 4. Mobile-First Experience
O FoodSync é usado primariamente no celular.
- **Bottom Sheet:** Prefira Drawers/Bottom Sheets (que sobem do rodapé) em vez de Modais centralizados no mobile.
- **Touch Targets:** Nenhum botão deve ter menos de 44x44px de área clicável.
- **Sticky Actions:** Botões de ação principal ("Confirmar Pedido") devem fixar no rodapé (`fixed bottom-4 left-4 right-4`).

## 5. Exemplo de Código (Card de Prato)
```tsx
<div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-[0.98]">
  <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
    <img src={src} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
  </div>
  <div className="mt-4">
    <h3 className="text-lg font-bold text-gray-900 tracking-tight">{name}</h3>
    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
  </div>
  <button className="mt-4 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition-colors hover:bg-gray-800">
    Adicionar
  </button>
</div>
```
