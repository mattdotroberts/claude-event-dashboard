# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start dev server (Vite on localhost:5173) + Convex backend watcher
npx convex dev   # run in one terminal — watches convex/ and syncs schema/functions
npm run dev      # run in another terminal — starts Vite

# Type-check + build
npm run build    # tsc -b && vite build

# Lint
npm run lint

# Deploy
npx convex deploy   # push Convex schema + functions to production
npx vercel --prod   # deploy frontend
```

There are no automated tests in this project.

## Architecture

**Two runtimes, one repo:**

- `convex/` — server-side functions that run on Convex's cloud. Schema-first: `schema.ts` defines the DB tables; `attendees.ts` and `topics.ts` export typed `query` and `mutation` functions. The generated API surface lives in `convex/_generated/` (don't edit these).
- `src/` — React + TypeScript SPA (Vite). Connects to Convex via `useQuery` / `useMutation` from the `convex/react` package. Real-time reactivity is automatic — any `useQuery` re-renders when its data changes on the server.

**Routes (React Router):**

| Path | Component | Purpose |
|------|-----------|---------|
| `/` or `/join` | `MobileFlow` | 5-screen attendee registration flow on phones |
| `/dashboard` | `Dashboard` | Big-screen live view shown at the event |
| `/groups` | `Groups` | Group breakdown view |
| `/admin` | `Admin` | Topic moderation + data reset |

**Data model (3 tables):**

- `attendees` — one row per registered attendee; stores name, role, experience level, location, spicy-take votes (spicyTake1/spicyTake2), offer/need strings, optional confession.
- `topics` — discussion topics (pre-seeded or attendee-proposed); `approved` field gates visibility. Seeded automatically on first dashboard load via `seedTopics` mutation.
- `topicVotes` — join table with indexes on `topicId`, `attendeeId`, and both combined. Each attendee can cast up to 2 topic votes.

**Key behaviors to know:**

- Returning attendees are identified by `attendeeId` stored in `localStorage` on the mobile flow. The ID is a Convex `Id<"attendees">`.
- `getTopicsWithVotes` (used by Dashboard + mobile voting) filters out topics where `approved === false`. `getAllTopicsWithVotes` (admin + proposer view) returns everything.
- Topics proposed by attendees start with `approved: false` and need admin approval before appearing on the dashboard.
- `MobileFlow` progresses through 5 screens; the attendee record is inserted at screen 4 submission, then patched with confession at screen 5.

## Customization points

- **Spicy take questions** — edit Screen3 in `src/pages/MobileFlow.tsx` and the matching statements in `src/pages/Dashboard.tsx`.
- **Seed topics** — edit `SEED_TOPICS` in `convex/topics.ts`.
- **Target attendee count** — `TARGET_ATTENDEES` constant in `src/pages/Dashboard.tsx`.
- **Slides** — `SLIDES` array in `src/components/WhatsUpClaude.tsx`.
- **Branding / colors** — CSS variables in `src/index.css`; logos in `public/`.

## Environment

Single env variable (written automatically by `npx convex dev`):
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```
