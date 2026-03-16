# unix — Dynamic Level Project

## Level: Dynamic (Fullstack with bkend.ai BaaS)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **State**: Zustand (client state)
- **Data Fetching**: TanStack Query
- **Backend**: bkend.ai BaaS (Auth, Database, File Storage)
- **Deployment**: Vercel (frontend) + bkend.ai (backend)

## Project Structure

```
src/
  app/          # Next.js App Router pages
  components/
    ui/         # Reusable UI primitives
    features/   # Feature-specific components
  hooks/        # Custom React hooks (useAuth, etc.)
  lib/
    bkend.ts    # bkend.ai REST client
    utils.ts    # Shared utilities
  stores/       # Zustand state stores
  types/        # TypeScript type definitions
docs/
  01-plan/      # PDCA Plan documents
  02-design/    # PDCA Design documents
  03-analysis/  # PDCA Gap Analysis
  04-report/    # PDCA Completion Reports
```

## Design System (Figma)

- **Tokens**: Semantic colors in `src/app/globals.css` (e.g., `--color-accent: #71aa8d`).
- **Typography**: Sans (Pretendard/Noto Sans KR), Title (MaruBuri/Nanum Myeongjo).
- **Styling**: Tailwind CSS v4 primary, `.card-surface` for complex patterns.
- **Components**: UI primitives in `src/components/ui`, Feature components in `src/components/features`.
- **Icons**: Preferred over emojis (Lucide recommended).

## Rules

- Use `src/lib/bkend.ts` for all bkend.ai API calls — never call the API directly
- Keep components in `components/ui/` under 200 lines
- Use TanStack Query for all server data; Zustand for UI state only
- **Figma Integration**: Map Figma styles to `globals.css` tokens. Use `.font-title` for serif headings.
- **Responsiveness**: Mobile-first via Tailwind.
- All env vars must be prefixed `NEXT_PUBLIC_` for client access or kept server-side
- Never commit `.env.local`

## bkend.ai MCP

MCP is configured in `.mcp.json`. First use opens a browser for authentication.
Run in Claude Code: `claude mcp add bkend --transport http https://api.bkend.ai/mcp`

## bkit PDCA Workflow

```
/pdca plan <feature>     → Plan
/pdca design <feature>   → Design
/pdca do <feature>       → Implement
/pdca analyze <feature>  → Gap Analysis
/pdca report <feature>   → Completion Report
```
