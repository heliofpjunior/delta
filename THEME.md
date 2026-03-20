# Documentação do Sistema de Temas (Delta360)

O sistema Delta360 utiliza um sistema de temas dinâmico (Claro/Escuro) baseado em classes do Tailwind CSS e variáveis CSS nativas.

## Funcionamento Técnico

1.  **Gerenciamento**: O `ThemeProvider.tsx` gerencia o estado do tema e aplica/remove a classe `.dark` no elemento `<html>`.
2.  **Persistência**: O tema escolhido é salvo no `localStorage` sob a chave `theme`.
3.  **Variáveis CSS**: As cores base são definidas em `app/globals.css` utilizando variáveis CSS.

## Variáveis CSS Principais

| Variável | Uso | Valor (Light) | Valor (Dark) |
| :--- | :--- | :--- | :--- |
| `--background` | Fundo principal da página | `#F8F9FA` | `#131314` |
| `--foreground` | Texto principal | `#111827` | `#E3E3E3` |
| `--card` | Fundo de cartões/painéis | `#FFFFFF` | `#1E1E1F` |
| `--border` | Bordas e divisores | `#D1D5DB` | `#333537` |
| `--muted` | Texto secundário/desativado | `#6B7280` | `#C4C7C5` |
| `--primary` | Cor de destaque (Azul) | `#3B82F6` | `#A8C7FA` |

## Padrões de Implementação Tailwind

Para garantir consistência visual em todo o sistema, siga estas classes:

### Superfícies e Bordas
-   **Painel Principal**: `bg-white dark:bg-[#1C1C1E] border border-[var(--border)]`
-   **Fundo de Input**: `bg-[#F8F9FA] dark:bg-[#1E1E1F] border border-[var(--border)]`
-   **Hover em Linhas**: `hover:bg-slate-50 dark:hover:bg-white/5`

### Tipografia
-   **Títulos**: `text-[var(--foreground)] font-black`
-   **Subtítulos/Labels**: `text-[var(--muted)] font-bold uppercase tracking-widest`
-   **Texto de Destaque**: `text-primary`

### Componentes de UI
Utilize os componentes globais que já suportam o tema:
-   `ThemeToggle`: Botão de alternância de tema.
-   `Sidebar`: Lateral com suporte a dark mode.
-   `Header`: Cabeçalho com transparência e desfoque (`backdrop-blur`).

## Como implementar em novas páginas

Sempre utilize o prefixo `dark:` para cores específicas do modo escuro ou, preferencialmente, utilize as variáveis CSS conforme o exemplo:

```tsx
<div className="bg-white dark:bg-[#1C1C1E] border border-[var(--border)] rounded-xl p-6">
  <h2 className="text-[var(--foreground)] font-bold">Título do Card</h2>
  <p className="text-[var(--muted)] text-sm">Descrição auxiliar aqui.</p>
</div>
```
