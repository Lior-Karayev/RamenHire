# RamenHire — Coding Standards

---

## TypeScript

- `strict: true` enforced via `tsconfig.json`
- No `any` — use `unknown`, explicit types, or generics
- No `// @ts-ignore` without an explanatory comment
- Prefer `type` over `interface` for local component types
- Path alias: `@/` maps to project root (e.g., `import { supabase } from "@/lib/supabase"`)

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase function | `export default function PostJobPage()` |
| Types | PascalCase | `type FormData = { ... }` |
| Constants | SCREAMING_SNAKE or camelCase | `INPUT_CLS`, `MAX_BYTES`, `slugify` |
| Supabase tables | snake_case | `job_post_requests` |
| CSS custom properties | kebab-case | `--color-brand` |
| Files | kebab-case dirs, camelCase files | `post-job/page.tsx`, `supabase.ts` |

---

## Component Rules

- **File size:** pages are large by necessity (MVP, no extracted components yet); prefer keeping logic in the page file until it needs to be reused
- No default prop objects — use explicit defaults in destructuring or `useState(INITIAL)`
- Event handlers: named `handle*` (e.g., `handleSubmit`, `handleFileInput`) or inline for trivial cases
- Form state: single object per form (`applyForm`, `subForm`) + separate status (`Status = "idle"|"loading"|"success"|"error"`)

---

## Error Handling

- All `supabase` calls: destructure `{ error }` and handle it before using data
- User-facing error messages: generic ("Something went wrong. Please try again.") — never expose raw Supabase error messages
- Special case error codes: handle explicitly (e.g., `error.code === "23505"` → duplicate email message)
- Async functions must handle both the success and error paths — no fire-and-forget

```typescript
// Pattern used throughout the codebase
const { error } = await supabase.from("table").insert({ ... });
if (error) {
  setStatus("error");
  setError("Something went wrong. Please try again.");
  return;
}
setStatus("success");
```

---

## Styling Rules

- Tailwind v4 — utility classes for layout/spacing/flex/grid
- Inline `style={{}}` for brand colors and design token values (more predictable than Tailwind color classes)
- Design tokens defined in `app/globals.css` `@theme` block — reference them via CSS vars in inline styles
- No CSS modules, no styled-components
- Mouse hover effects: `onMouseEnter`/`onMouseLeave` with inline style mutation (no Tailwind `hover:` for colors)
- Focus effects: `onFocus`/`onBlur` handlers (`focusOrange` / `blurGray` helper functions)

---

## Supabase Client Usage

- Always import from `@/lib/supabase` — never create a new client inline
- Destructure `{ data, error }` from every Supabase call
- Use `.from("table").insert()` / `.select()` / `.update()` / `.delete()` — never raw SQL from client
- Storage: `supabase.storage.from("cvs").upload(path, file, options)`

---

## Comments

Write no comments unless the WHY is non-obvious. One short line max. Section headers (e.g., `// ── APPLY MODAL ───`) are acceptable for large page files to aid navigation.

---

## File Organization

```
lib/          → Shared utilities and clients (supabase.ts)
app/          → Pages and layouts only (Next.js App Router convention)
scripts/      → One-off Node.js scripts and SQL files
public/       → Static assets only
docs/         → Developer documentation
```

No `components/` directory yet — all components are inline in page files (acceptable for current MVP scope).
