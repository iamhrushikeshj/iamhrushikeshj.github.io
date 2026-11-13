# HJ — Portfolio



## Files

| File | Purpose |
|------|---------|
| `index.html` | Main page (8 tabs, terminal, contact form) |
| `style.css` | All styles |
| `script.js` | Tabs, zoom transitions, keyboard shortcuts, boot, service worker |
| `sw.js` | Service worker (offline support) |
| `404.html` | Custom "Route Not Found" page |
| `robots.txt`, `sitemap.xml` | SEO |
| `icon.svg` | PWA icon |

## Setup

1. **Add your files**
   - `profile.jpg` — your photo (square, ~400×400px)
   - `resume.pdf` — your résumé (Intro tab links to it)

2. **Replace placeholders** — search/replace across the project:
   - `+919999999999` → your phone (E.164 format, no spaces)
   - `testmail@test.com` → your email
   - `@hrushikesh` / `t.me/hrushikesh` → your Telegram handle
   - `linkedin.com/in/testlinkedin` → your LinkedIn URL
   - `YOURUSERNAME` → your GitHub username (in `index.html`, `robots.txt`, `sitemap.xml`)
   - `preview.png` → a 1200×630 social-share image you can add

3. **Contact form** works via `mailto:` — no setup needed. On desktop it opens
   the default mail client, on mobile it opens Gmail/Outlook/etc.

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/YOURUSERNAME.github.io.git
git push -u origin main
```

Then in **GitHub → Settings → Pages**:
- Source: **Deploy from a branch**
- Branch: **main** / **(root)**
- Save

Site live at `https://YOURUSERNAME.github.io/` (repo must be named
`YOURUSERNAME.github.io` for the root domain to work).

### Custom domain (optional)
1. Add a file called `CNAME` containing just `yourdomain.com`
2. Configure DNS: `A` records → GitHub Pages IPs, or `CNAME` → `YOURUSERNAME.github.io`
3. Enable "Enforce HTTPS" in Settings → Pages


## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1`–`7` | Jump to tab |
| `←` / `→` | Previous / next tab |
| Click / any key | Skip boot screen |

## Editing the tab order

In `script.js`:
```js
const TAB_ORDER = ['intro','about','experience','internships','skills','projects','terminal','contact'];
```
Reorder / add / remove — but keep every entry backed by a `<section data-panel="...">`
in `index.html`. Labels live in `TAB_LABELS`.

## Accessibility

- Fully keyboard-navigable
- `prefers-reduced-motion` disables zoom + boot animation
- `aria-label`s on all icon-only links and pager buttons
- No custom cursor on touch devices
