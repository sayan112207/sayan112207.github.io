# Portfolio — Sayan Banerjee

APM / product & growth portfolio. Live at **[sayanbanerjee.pages.dev](https://sayanbanerjee.pages.dev/)** (Cloudflare Pages).

Static site, no build step: plain HTML, CSS and vanilla JS, with Bootstrap 5 for the grid.

## Run locally

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>. The hostname redirect in `index.html` only fires on `sayan112207.github.io`, so localhost is unaffected.

## Layout

- `index.html` — the entire site, one page, including the inline JSON-LD `@graph`
- `assets/css/style.css` — all styles, plus the self-hosted `@font-face` rules
- `assets/fonts/` — Inter + Montserrat woff2, preloaded so web fonts don't shift layout
- `assets/img/` — logos (WebP) and favicons
- `script.js` — accordions, scroll reveal, animated counters, theme toggle
- `resume/` — resume PDF and its viewer page
- `robots.txt`, `sitemap.xml`, `llms.txt` — crawler files

## Notes

Metrics appear in the page copy, the JSON-LD, and `llms.txt`. The latter two are generated from the rendered DOM — regenerate them rather than editing by hand, so they can't drift from the page.

## Contact

- Website: <https://sayanbanerjee.pages.dev/>
- LinkedIn: <https://www.linkedin.com/in/sayan18/>
- Email: <sayan112207@gmail.com>
