# RamenHire — Package Inventory

Generated from `package.json`. Versions are `^` (caret) ranges.

---

## Dependencies (production)

| Package | Version | Purpose |
|---|---|---|
| `next` | ^16.2.9 | React framework — App Router, SSR, Image, Script, Font |
| `react` | ^19.2.7 | UI library |
| `react-dom` | ^19.2.7 | React DOM renderer |
| `@supabase/supabase-js` | ^2.110.0 | Supabase client — DB queries, Storage, Auth |

---

## DevDependencies

| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^6.0.3 | Type checking (strict mode) |
| `@types/node` | ^26.0.1 | Node.js type definitions |
| `@types/react` | ^19.2.17 | React type definitions |
| `@types/react-dom` | ^19.2.3 | React DOM type definitions |
| `tailwindcss` | ^4.3.2 | Utility-first CSS (v4 — no config file required) |
| `@tailwindcss/postcss` | ^4.3.2 | Tailwind v4 PostCSS integration |
| `postcss` | ^8.5.16 | CSS transform pipeline |
| `autoprefixer` | ^10.5.2 | Adds vendor prefixes to CSS |
| `next-sitemap` | ^4.2.3 | Generates sitemap.xml + robots.txt at build time |
| `puppeteer` | ^25.3.0 | Headless Chrome — used by `scripts/screenshot.js` for OG image |

---

## Tailwind v4 Notes

Tailwind v4 does **not** use a `tailwind.config.js`. Configuration lives in `app/globals.css`:
```css
@import "tailwindcss";
@theme {
  --color-brand: #C8501A;
  /* ... */
}
```
Do not create a `tailwind.config.js` — it will conflict.

---

## Adding New Packages

1. Check npm downloads (≥ 50k/week for general packages)
2. Check last publish date (not stale > 1 year)
3. Check GitHub stars and open issues
4. `npm install <package>`
5. `npm audit` immediately after
6. Update this file with name, version, purpose
7. If a new dev tool: add to devDependencies with `--save-dev`

---

## Removing Packages

1. `npm uninstall <package>`
2. Remove from this file
3. Verify no import references remain (`grep -r "package-name" app/ lib/`)
