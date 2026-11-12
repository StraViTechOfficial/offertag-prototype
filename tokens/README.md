# Tokens — how to use in Next.js
v0.1 · 2026-11-09 · Brand source: `../brand/brand.md`. Decisions D-027, D-029, D-037, D-038.

## Files
- `tokens.css` — primitives, light/dark roles, base styles. Framework-agnostic.
- `tailwind.css` — Tailwind 4 `@theme inline` bridge so roles become utilities (`bg-surface`, `text-muted`, `text-save`, `rounded-md`, `shadow-2`).

## Rules
1. Components use **roles** (`--surface`, `--text-muted`, `--badge-bg`) never primitives (`--navy-800`). Primitives exist so roles can be retuned in one place.
2. Gold appears through four roles only: `--badge-bg/--badge-fg`, `--save`, `--label`, `--rule`. Never as a button, large fill, or next to a store logo.
3. `--err` is for form errors and destructive admin actions. Never for discounts, expiry or urgency.
4. Expired state: `--expired-badge-*` + icon + `filter: grayscale(1)` on the image. Never colour alone.
5. Product image area uses `--img-well` (white in both modes) with `--img-well-edge` inset ring and a fixed aspect ratio.
6. Jost (`--font-display`) only at `--text-lg` and above, and for prices with `font-variant-numeric: tabular-nums`. Inter for everything else.
7. Phone layout is the default; `md:` (900px) switches to the desktop layout, which is designed separately (D-027). `sm:` (600px) is tablet adaptation only.
8. Pressed states are mandatory (`:active`), hover is optional: many sessions run in WhatsApp/Telegram in-app browsers.

## Next.js wiring
Fonts via `next/font` so the CSS variables `--font-jost` and `--font-inter` exist before `tokens.css` reads them:
```tsx
// app/layout.tsx
import { Inter, Jost } from "next/font/google";
import "@/design-system/tokens/tailwind.css"; // or tokens.css without Tailwind
const inter = Inter({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-inter", display: "swap" });
const jost  = Jost({ subsets: ["latin"], weight: ["600","700"], variable: "--font-jost", display: "swap" });
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jost.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body>{children}</body>
    </html>
  );
}
```
No-flash theme script (runs before paint; stored choice wins, else system):
```js
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('ot-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;
```
Toggle: set `document.documentElement.dataset.theme` to `light` | `dark` and store it; remove the attribute to follow the system.

## Verification
Open `tokens-preview.html` in a browser: it loads `tokens.css` and renders every role in both modes with live contrast. All text roles ≥ 4.5:1, UI boundaries ≥ 3:1.
