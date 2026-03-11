# Ticko Frontend

Production-ready frontend for the **Ticko** event ticketing platform. Built with Next.js 14 (App Router), TypeScript, Chakra UI, TanStack Query, and React Hook Form + Zod.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Chakra UI** – components and theme
- **TanStack Query** – API state and caching
- **Axios** – HTTP client with JWT interceptors
- **React Hook Form + Zod** – forms and validation
- **qrcode.react** – QR code generation for tickets
- **html5-qrcode** – QR scanning (camera)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. (Optional) Configure API base URL. Create `.env.local`:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

   Default is `http://localhost:3000/api` if not set.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3001](http://localhost:3001) (Next.js default port; ensure it doesn’t conflict with your API on 3000).

## Scripts

- `npm run dev` – start development server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – run ESLint

## Project structure

```
src/
├── app/                    # App Router pages
│   ├── page.tsx            # Home (event list)
│   ├── events/[id]/        # Event detail + ticket purchase
│   ├── auth/login/         # Login
│   ├── auth/register/      # Register
│   ├── tickets/            # User tickets + QR codes
│   ├── dashboard/          # Organizer dashboard
│   │   └── events/         # Create / edit events, stats
│   └── scan/               # QR ticket scanner
├── components/              # Reusable UI
├── lib/                    # API client, auth, theme, types
├── hooks/                  # useAuth, useEvents, useTickets
└── providers/              # Query + Chakra providers
```

## Features

- **Public:** Home (event list), event detail, ticket type selection, “Buy tickets”
- **Auth:** Login / register with JWT, redirect after login
- **User:** My tickets with QR codes
- **Organizer:** Dashboard, create/edit events, ticket types, event stats
- **Scanner:** Camera-based QR scan and `/tickets/scan` integration
- **UX:** Loading states, error alerts, toasts, protected routes, responsive layout

## API

The app expects a REST API at `NEXT_PUBLIC_API_URL` (default `http://localhost:3000/api`) with the endpoints described in the project spec (auth, events, tickets, payments, dashboard, health). The Axios client in `src/lib/api.ts` attaches the JWT and handles 401 (logout + redirect to login).
