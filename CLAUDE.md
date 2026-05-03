# Project Guide

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build (Turbopack)
npm run lint     # ESLint

npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma migrate dev       # Apply schema changes to local DB
npx prisma db push           # Push schema to DB without migrations (useful for prototyping)
npx prisma studio            # Open Prisma Studio GUI
```

npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests (requires dev server running)

## Architecture

**Next.js 16 App Router** with two route groups:
- `app/(app)/` — main app pages, all wrapped by `app/(app)/layout.tsx` which adds Header + BottomNav
- `app/(auth)/` — auth-only pages (sign-in), minimal layout

**Route protection** is handled in `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) using Auth.js v5's `auth()` wrapper. `/favourites`, `/shopping-list`, and `/meal-planner` redirect unauthenticated users to `/sign-in`.

**Auth** — Auth.js v5 (`next-auth@beta`) with Google and GitHub OAuth. Config lives in `lib/auth.ts`. The `SessionProvider` is in the root `app/layout.tsx` (server component that passes the session). Client components use `useSession()` from `next-auth/react`; server components use `auth()` from `@/lib/auth`.

**Database** — Prisma 6 + PostgreSQL (Neon recommended). Singleton client in `lib/prisma.ts`. Schema at `prisma/schema.prisma`. Key models: `Favourite`, `ShoppingItem`, `MealPlanItem`, plus NextAuth's required `User`, `Account`, `Session`, `VerificationToken`.

**Spoonacular API** — all calls go through typed helpers in `lib/spoonacular.ts` (`searchRecipes`, `getRecipe`, `getSimilarRecipes`). These are called server-side only (API routes or server components). The key is `SPOONACULAR_KEY` env var. Search uses `addRecipeInformation=true&addRecipeNutrition=true` so results include time, servings, diets, and calories without extra round-trips.

**UI** — shadcn/ui built on **Base UI** (not Radix). This means `asChild` is not available on `Button` or other primitives. Use `buttonVariants()` directly on `<Link>` elements instead. New shadcn components can be added with `npx shadcn@latest add <name>`.

**Styling** — Tailwind CSS 4 with CSS custom properties for theming. Dark mode uses the `.dark` class via `next-themes`. Theme variables are in `app/globals.css`.

**DnD** — `@dnd-kit/core` + `@dnd-kit/sortable` powers the meal planner. Draggable recipes are in `components/meal-planner/draggable-recipe.tsx`; droppable calendar cells in `components/meal-planner/weekly-calendar.tsx`. The full client orchestration is in `components/meal-planner/meal-planner-client.tsx`.

## Environment Variables

All required — see `.env` for placeholders:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | Auth.js signing secret (`npx auth secret`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth app |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth app |
| `SPOONACULAR_KEY` | Spoonacular food API key |

## Key Patterns

**Dynamic route params in Next.js 16** are Promises — always `await params`:
```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

**Link as button** — because Base UI Button has no `asChild`:
```tsx
import { buttonVariants } from '@/components/ui/button'
<Link href="/somewhere" className={buttonVariants({ variant: 'outline', size: 'sm' })}>...</Link>
```

**Auth-gated API routes** — check session and return 401 if missing:
```ts
const session = await auth()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
const userId = session.user.id
```
