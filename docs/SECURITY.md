# RamenHire — Security Rules

Claude must apply these rules on every task without being asked.

---

## Environment Variables

| Rule | Detail |
|---|---|
| Only `NEXT_PUBLIC_*` vars in client code | `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only |
| Never use `service_role` key in client | It bypasses RLS — server/edge only |
| Never hardcode keys in source | Always read from `process.env.*` |
| `.env.local` is gitignored | Confirmed in `.gitignore` — never commit it |

---

## GitHub / Git Rules

- **Never `git push`** without explicit user instruction
- **Never force-push** to `main`
- **Never bypass hooks** (`--no-verify`)
- Confirm before any destructive git operation (reset --hard, branch -D, etc.)

---

## Database / Supabase Rules

- **Never run migrations on production** without user approval
- Test SQL changes in `scripts/` files first; confirm before executing via MCP
- Every new table **must** have RLS enabled (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`)
- Follow existing policy pattern: anon INSERT only, authenticated SELECT/UPDATE/DELETE
- Never `DROP TABLE` or `TRUNCATE` without explicit user instruction

### RLS Policy Template (for new tables)
```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.new_table TO anon;
GRANT SELECT, UPDATE, DELETE ON public.new_table TO authenticated;
CREATE POLICY "anon_insert_new_table" ON new_table FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_select_new_table" ON new_table FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_new_table" ON new_table FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_new_table" ON new_table FOR DELETE TO authenticated USING (true);
```

---

## File Upload Security

Current client-side validation (`app/page.tsx → validateFile()`):
- Allowed MIME: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Allowed extensions: `.pdf`, `.doc`, `.docx` (double-checked in case MIME is missing)
- Max size: 5 MB (`5 * 1024 * 1024` bytes)

Supabase Storage bucket enforces the same MIME list and 5 MB limit server-side.

When adding new upload types: update both client validation and the bucket's `allowed_mime_types`.

---

## Package Vetting Checklist

Before installing any new npm package:
1. Check npm weekly downloads (reject if < 50k/week for non-niche packages)
2. Check last publish date (reject if > 1 year stale)
3. Check GitHub stars and open issues
4. Run `npm audit` immediately after install
5. Prefer packages already used by Next.js ecosystem

---

## TypeScript Security

- No `any` types — use `unknown` or proper generics
- No `// @ts-ignore` without a comment explaining why
- No `dangerouslySetInnerHTML` with user-supplied content (only JSON-LD in `layout.tsx`, which is internal data)

---

## XSS / Injection

- All user input goes directly to Supabase parameterized queries (no string concatenation into SQL)
- No `eval()` or dynamic `import()` with user-supplied paths
- `dangerouslySetInnerHTML` is used in `layout.tsx` for JSON-LD only — content is static internal data, not user input
