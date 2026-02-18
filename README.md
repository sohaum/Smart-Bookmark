# Markly

A full-stack bookmark management app built with Next.js 15, Supabase, and Tailwind CSS. Users sign in with Google OAuth, save bookmarks, and see changes sync in real-time across all open tabs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Row Level Security, Realtime) |
| Auth | Google OAuth via Supabase Auth |
| Realtime | Supabase Realtime (Postgres Changes) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A Google Cloud project with OAuth 2.0 credentials

### 1. Clone and install

```bash
git clone https://github.com/your-username/markly.git
cd markly
npm install
```

### 2. Set up the database

Run the migration in the Supabase SQL Editor:

```bash
# Copy and execute the contents of this file in your Supabase SQL Editor
scripts/001_create_bookmarks.sql
```

This creates the `bookmarks` table, enables Row Level Security, and enables Realtime on the table.

### 3. Configure Google OAuth

1. Go to **Authentication > Providers > Google** in your Supabase dashboard
2. Enter your Google Client ID and Secret (from [Google Cloud Console](https://console.cloud.google.com))
3. Set the redirect URL to: `https://<your-project>.supabase.co/auth/v1/callback`

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Override OAuth redirect URL for local development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
markly/
├── app/
│   ├── layout.tsx              # Root layout (HTML shell, fonts, metadata)
│   ├── globals.css             # Tailwind config + design tokens
│   ├── page.tsx                # Landing page (/)
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx        # Google OAuth login page (/auth/login)
│   │   └── callback/
│   │       └── route.ts        # OAuth callback handler (/auth/callback)
│   └── dashboard/
│       └── page.tsx            # Main bookmark dashboard (/dashboard)
├── components/
│   ├── dashboard-header.tsx    # Top nav bar with user info + sign out
│   ├── add-bookmark-form.tsx   # Form to add new bookmarks
│   ├── bookmark-list.tsx       # Bookmark grid with real-time subscriptions
│   ├── bookmark-card.tsx       # Individual bookmark card
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── types.ts                # TypeScript interfaces (Bookmark)
│   ├── utils.ts                # Utility functions (cn for classnames)
│   └── supabase/
│       ├── client.ts           # Browser-side Supabase client
│       ├── server.ts           # Server-side Supabase client
│       └── middleware.ts       # Session refresh + route protection
├── middleware.ts               # Next.js middleware entry point
└── scripts/
    └── 001_create_bookmarks.sql  # Database migration
```

---

## Database Schema

```sql
bookmarks
├── id          UUID         -- Primary key, auto-generated
├── user_id     UUID         -- Foreign key -> auth.users (cascading delete)
├── url         TEXT         -- The bookmark URL
├── title       TEXT         -- User-given title
└── created_at  TIMESTAMPTZ  -- Auto-set to now()
```

Row Level Security ensures users can only read, insert, and delete their own bookmarks. The `anon` key is safe to expose publicly because all queries are filtered by `auth.uid() = user_id`.

---

## How It Works

### Authentication Flow

```
User visits / --> Already logged in? --> Redirect to /dashboard
                  Not logged in?     --> Landing page

Click "Sign In" --> /auth/login --> Click "Continue with Google"
    --> Supabase initiates OAuth with Google
    --> Google consent screen
    --> Redirect to /auth/callback?code=...
    --> Code exchanged for session (cookies set)
    --> Redirect to /dashboard
```

### Real-time Sync

When a bookmark is added or deleted, three mechanisms keep the UI in sync:

1. **Supabase Realtime subscription** — listens for `INSERT` and `DELETE` events on the `bookmarks` table and updates React state immediately. This is how changes from other open tabs appear without a page refresh.
2. **Refetch callbacks** — after the current user adds or deletes a bookmark, the list immediately refetches from the database to confirm the operation.
3. **Polling fallback** — the list refetches every 3 seconds as a safety net in case the Realtime connection drops.

### Server vs. Client Components

| File | Type | Reason |
|---|---|---|
| `app/page.tsx` | Server | Auth check + static render only |
| `app/dashboard/page.tsx` | Server | Fetches bookmarks before rendering HTML |
| `app/auth/callback/route.ts` | Route Handler | Code exchange must happen server-side |
| `app/auth/login/page.tsx` | Client | Needs `onClick` and `useState` |
| `components/dashboard-header.tsx` | Client | Sign out handler + `useRouter` |
| `components/add-bookmark-form.tsx` | Client | Form state + submit handler |
| `components/bookmark-list.tsx` | Client | `useEffect` for Realtime subscription |
| `components/bookmark-card.tsx` | Client | Delete handler + loading state |

---

## Security

- **Row Level Security (RLS)** — all database queries are restricted to the authenticated user's own rows, enforced at the database level.
- **HTTP-only cookies** — session tokens are never stored in `localStorage`, protecting against XSS.
- **Server-side code exchange** — the OAuth `code` is exchanged for a session in a Route Handler, not in the browser.
- **Middleware token refresh** — session tokens are refreshed on every request via `middleware.ts` to prevent unexpected logouts.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
