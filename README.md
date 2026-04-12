# Claude Event Dashboard

A real-time "living wall" event app for Claude community meetups. Attendees scan a QR code, answer quick questions on their phone, and their responses appear live on a big-screen dashboard.

Built for [Claude for Everyone Barcelona](https://claude-event-app.vercel.app) events hosted by [Happy Operators](https://www.happyoperators.com/community) and [AI Summit Barcelona](https://aisummitbarcelona.com/).

## What it does

**For attendees (mobile):**
- 5-screen flow: name/role, AI experience level, spicy take votes, topic voting, anonymous AI confession
- Vote on discussion topics or propose new ones
- Returning users are recognized via localStorage

**For the big screen (dashboard):**
- Real-time attendee count with progress bar
- QR code for joining
- Spicy take poll results with animated bars
- Hot topics leaderboard with live vote counts
- Experience level donut chart
- Location breakdown (locals vs visitors)
- Anonymous AI confessions feed
- Scrolling ticker with recent activity
- A crawling Claude character that randomly appears on any edge
- "What's Up Claude?" presentation slideshow (keyboard nav, image lightbox)
- Splash overlay with event branding
- Free API credits overlay

**For organizers (admin):**
- Topic moderation (approve/reject user-proposed topics)
- Add topics directly
- Reset all event data

## Tech stack

- **Frontend:** React + TypeScript + Vite
- **Database:** [Convex](https://convex.dev) (real-time, reactive queries)
- **Hosting:** Vercel
- **Fonts:** Space Grotesk, JetBrains Mono, DM Sans, Lora (Google Fonts)

## Getting started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account (free tier works)

### Setup

```bash
# Install dependencies
npm install

# Set up Convex (creates your database)
npx convex dev

# This will prompt you to log in and create a project.
# It writes CONVEX_DEPLOYMENT to .env.local automatically.

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` with three routes:

| Route | Purpose |
|-------|---------|
| `/` | Big screen dashboard |
| `/join` | Mobile attendee flow |
| `/admin` | Topic moderation + reset |

### Environment

The only env variable needed is set automatically by `npx convex dev`:

```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### Deploy

```bash
# Deploy Convex functions
npx convex deploy

# Deploy frontend to Vercel
npx vercel --prod
```

## Customization

### Spicy take questions

Edit the questions in `src/pages/MobileFlow.tsx` (Screen3) and `src/pages/Dashboard.tsx` (SpicyPoll statements).

### Seed topics

Edit `SEED_TOPICS` in `convex/topics.ts`. Topics are seeded on first dashboard load.

### Target attendee count

Change `TARGET_ATTENDEES` in `src/pages/Dashboard.tsx`.

### Event branding

- Logos: `public/` directory
- Splash overlay: `src/components/SplashOverlay.tsx`
- Header: `src/components/EventHeader.tsx`
- Colors: CSS variables in `src/index.css`

### "What's Up Claude?" slides

Edit the `SLIDES` array in `src/components/WhatsUpClaude.tsx`. Supports text-only and text+image layouts.

## Project structure

```
src/
  components/
    ClaudeCharacter.tsx    # Animated Claude mascot
    CrawlingClaude.tsx     # Random edge-crawling Claude
    EventHeader.tsx        # Top bar with logos
    SplashOverlay.tsx      # Opening splash screen
    WhatsUpClaude.tsx      # Presentation slideshow
    ProgressBar.tsx        # Mobile flow progress
  pages/
    Dashboard.tsx          # Big screen view
    MobileFlow.tsx         # Attendee phone flow
    Admin.tsx              # Topic moderation
convex/
    schema.ts              # Database schema
    attendees.ts           # Attendee mutations/queries
    topics.ts              # Topics + voting logic
public/
    globe-braces.svg       # Splash illustration
    free-credits.png       # API credits promo
    slide-*.png            # Slideshow images
    logo-*.svg/png         # Partner logos
```

## License

MIT
