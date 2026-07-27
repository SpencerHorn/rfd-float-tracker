# RFD Float Tracker

RFD Float Tracker is a web application for Raleigh Fire Department staffing operations.
It helps crews track personnel float assignments between stations, keep assignment history,
and manage active station personnel in a simple dashboard.

## Application Summary

- Track station-level personnel assignments.
- Record float events with destination station and optional notes.
- View per-person float counts and float history.
- Reset float counts as needed for shift or reporting cycles.
- Soft-remove personnel from active station rosters.

## Tech Stack

- SvelteKit (Svelte 5) with Vite
- TypeScript
- Drizzle ORM
- SQLite via better-sqlite3
- Tailwind CSS (with app-level design tokens)
- Vitest and Playwright for testing

## Local Development

1. Install dependencies:

```sh
npm install
```

2. Run migrations:

```sh
npm run db:migrate
```

3. Start the app:

```sh
npm run dev
```

4. Open `http://localhost:5173`.

## Production Deployment (Render)

This repository includes a Render Blueprint file at `render.yaml`.

### Important Database Note

To avoid unexpected empty databases after deploy, migrations should run when the app starts
on the running instance (where the persistent disk is mounted), not during the build phase.

This project is configured to do that with:

- `npm run db:migrate:prod` -> runs runtime migrations against `DATABASE_PATH`
- `npm run start:render` -> migrates first, then starts the server

### Render Setup Steps

1. Push your latest code to GitHub.
2. In Render, create or update a Web Service using this repo.
3. Ensure the service uses the `render.yaml` values:
	- Build Command: `npm install && npm run build`
	- Start Command: `npm run start:render`
4. Configure environment variables:
	- `NODE_ENV=production`
	- `DATABASE_PATH=/var/data/rfd-float-tracker.db`
5. Attach a persistent disk:
	- Mount Path: `/var/data`
	- Size: at least 1 GB
6. Deploy.

### Verifying Deployment

After deploy, check Render logs for:

- successful migration output from `db:migrate:prod`
- app startup from `node build/index.js`

If you ever see a 500 on first boot, check that `DATABASE_PATH` and the disk mount path
still match exactly. A changed path can make the app point at a new empty SQLite file.

## Useful Scripts

- `npm run dev` - start local dev server
- `npm run build` - create production build
- `npm run start` - run built Node server
- `npm run db:migrate` - run Drizzle migrations via drizzle-kit
- `npm run db:migrate:prod` - run runtime migrations for production startup
- `npm run start:render` - production startup flow for Render
