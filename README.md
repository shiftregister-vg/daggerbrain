# Daggerlore

Daggerlore is a DNDBeyond-style set of digital tools for the Daggerheart TTRPG. This software is available through the MIT license (see the license in the repo).

Daggerlore includes materials from the Daggerheart System Reference Document 1.0, © Critical Role, LLC. under the terms of the Darrington Press Community Gaming (DPCGL) License. More information can be found at https://www.daggerheart.com. There are no previous modifications by others

This repo includes character, campaign, encounter, homebrew, and stream overlay tools, as well as a markdown style Blog, subscriptions through Clerk billing, and more.

Basic Stack:
- PostgreSQL in production and SQLite for local development
- Sveltekit (fullstack framework)
- Cloudflare Workers (deploy target)
- Cloudflare R2 (image storing)
- Clerk (Auth and Billing)

## Prerequisites
- NPM (node 24 or later)
- A Clerk application for authentication

## Install

```bash
npm install
```

## Environment
There is a `.env.example` file in the repo that you can use as a template to set up your own `.env.local` environment file.

## Clerk Setup

Create a Clerk application and copy its publishable key, secret key, and frontend
API/issuer URL into `.env.local`.

For subscriptions, enable Clerk Billing for user subscriptions and connect it to
Stripe. Clerk automatically creates a default free plan when Billing is enabled;
set that free plan's slug to `free_user`. Create a paid plan with the slug
`adventurer`, then attach these features to that paid plan:

- `unlimited_characters`
- `unlimited_homebrew`

The `/subscribe` page renders Clerk's `PricingTable`, and successful checkout
returns to `/subscribe/success`.

## Database Setup

For local development, set `DATABASE_PROVIDER=sqlite` and `SQLITE_PATH` in
`.env.local`, then run:

```bash
npm run db:migrate
```

For production or PostgreSQL development, set `DATABASE_PROVIDER=postgres` and
`DATABASE_URL`, then run the same migration command.

The app does not need a separate seed step for normal local use. When a user
signs in for the first time, the app creates the user record.

## Run The App

Start the SvelteKit dev server in a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Cloudflare And R2

The normal Vite dev server is enough for most frontend and app work. Image
upload and image proxy routes depend on Cloudflare platform bindings for
`R2_IMAGES` and `R2_USERCONTENT`; without those bindings, those routes will
return a dependency unavailable response.

To test closer to the Cloudflare runtime, build first and then run Wrangler:

```bash
npm run build
npx wrangler dev
```

You will also need Cloudflare credentials and R2 bucket bindings configured for
your own account.

## Sentry
You will need to update `/src/hooks.server.ts` with your Sentry DSN url.
Also you will need to update `/vite.config.ts` with your sentry org and project names

## Troubleshooting

- `PUBLIC_ORIGIN environment variable is not set`: add `PUBLIC_ORIGIN=http://localhost:5173`
  to `.env.local` and restart the dev server.
- The app redirects to `/maintenance`: set `MAINTENANCE_MODE=false`, or set
  `ADMIN_CLERK_ID` to the signed-in Clerk user id.
- Image upload fails locally: run with Cloudflare/R2 bindings or avoid upload
  features during normal Vite development.
