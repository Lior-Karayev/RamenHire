# RamenHire — Database

**Project ID:** `oweurollqvbffehorhss`
**URL:** `https://oweurollqvbffehorhss.supabase.co`
**Region:** (Supabase default)
**Auth strategy:** No app-level auth. Anon key for public writes. Admin reads via Supabase dashboard.

---

## Tables

### `applications`
Stores job applications submitted by candidates.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| job_title | text | NO | — | From hardcoded job list |
| company_name | text | NO | — | From hardcoded job list |
| applicant_name | text | NO | — | |
| applicant_email | text | NO | — | |
| why_interested | text | NO | — | Free text |
| cv_link | text | YES | — | URL fallback |
| cv_storage_path | text | YES | — | Path in `cvs` bucket |
| cv_file_name | text | YES | — | Original filename |
| created_at | timestamptz | YES | now() | |
| status | text | YES | 'pending' | Manual admin workflow |

**Live rows:** 4

---

### `job_post_requests`
Stores employer submissions from the /post-job form. Admin reviews and manually publishes.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| company_name | text | NO | — | |
| contact_name | text | NO | — | |
| contact_email | text | NO | — | |
| company_website | text | YES | — | |
| revenue_range | text | YES | — | Enum: pre-revenue / under-10k / 10k-50k / 50k-100k / 100k-plus / prefer-not-to-say |
| job_title | text | NO | — | |
| job_type | text | NO | — | Enum: full-time / part-time / contract |
| location | text | NO | — | Free text e.g. "Remote · Worldwide" |
| salary_range | text | NO | — | Free text e.g. "$80,000 – $110,000" |
| job_description | text | NO | — | |
| company_description | text | NO | — | |
| is_bootstrapped | boolean | NO | — | |
| application_link | text | NO | — | URL or email |
| created_at | timestamptz | YES | now() | |
| status | text | YES | 'pending' | Manual admin workflow |

**Live rows:** 2

---

### `subscribers`
Email list for weekly job digest.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| full_name | text | NO | — | |
| email | text UNIQUE | NO | — | Duplicate → error code 23505 |
| role_types | text[] | YES | — | Array e.g. ['Engineering', 'Product'] |
| created_at | timestamptz | YES | now() | |

**Live rows:** 3

---

## RLS Policy Summary

All tables follow the same pattern:

| Role | INSERT | SELECT | UPDATE | DELETE |
|---|---|---|---|---|
| anon | ✓ | — | — | — |
| authenticated | — | ✓ | ✓ | ✓ |

---

## Storage: `cvs` Bucket

| Property | Value |
|---|---|
| Bucket ID | `cvs` |
| Public | false |
| File size limit | 5,242,880 bytes (5 MB) |
| Allowed MIME | pdf, msword, openxmlformats docx |
| anon policy | INSERT (upload) |
| authenticated policy | SELECT (download) + DELETE |
| Path pattern | `{job-slug}/{company-slug}/{timestamp}_{filename}` |

---

## SQL Files

| File | Purpose | When to run |
|---|---|---|
| `scripts/schema.sql` | Full schema — all 3 tables + RLS | Once, on new DB |
| `scripts/add-cv-storage.sql` | CV bucket + cv columns migration | Once, already applied to prod |
| `scripts/seed.sql` | Test data | Dev/staging only, never production |

---

## Migration Strategy

1. Write SQL in `scripts/` directory
2. Review with user before executing
3. Apply via Supabase MCP (`mcp__supabase__execute_sql`) only after approval
4. For DDL (CREATE/ALTER/DROP): use `mcp__supabase__apply_migration` instead of execute_sql
5. **Never run on production without explicit user confirmation**

---

## Supabase MCP Access

Project is connected via Supabase MCP. Common operations:
```
List tables:    mcp__supabase__list_tables (project_id: oweurollqvbffehorhss)
Run SQL:        mcp__supabase__execute_sql
Apply DDL:      mcp__supabase__apply_migration
Check logs:     mcp__supabase__get_logs
```
