# Bengkel Desa — Vite + React + Tailwind

Modern single-page app scaffold designed for Netlify deployment.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

Netlify

- `netlify.toml` is included and configures SPA redirects and build settings.
- Set `Publish directory` to `dist` in Netlify site settings.

Optional: Netlify CLI

Install the Netlify CLI to deploy from your machine (requires login):

```bash
npm install -g netlify-cli
netlify login
npm run build
npm run deploy   # uses `netlify deploy --prod --dir=dist`
```

Or connect your Git repo to Netlify and let Netlify build automatically.
