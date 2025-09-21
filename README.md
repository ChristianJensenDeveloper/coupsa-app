# Coupsa (cleaned)

This is a cleaned version of the Figma Make export prepared for deployment on Vercel.

## What I changed
- Ensured `package.json` has `dev`, `build`, and `preview` scripts.
- Set `engines.node` to >=18 <=20 to match Vercel build environment.
- Added `.env.example` listing environment variable NAMES (no secrets).
- Added a GitHub Actions **Preflight** workflow (`.github/workflows/preflight.yml`) that builds the app on Node 20 and checks `.env.example`.
- Did not change visual/layout files.

## Quick deploy steps
1. Push the cleaned project to GitHub (replace repository contents).
2. In Vercel, import this repo and set:
   - Build Command: `npm run build`
   - Output Directory: `dist` (for Vite) or leave default for Next.js if converted later.
3. Add environment variables in Vercel (see `.env.example`).
4. Click Deploy.



  # Web App

  This is a code bundle for Web App. The original project is available at https://www.figma.com/design/cW7OTuxMhx3tpyFbmkUW64/Web-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  