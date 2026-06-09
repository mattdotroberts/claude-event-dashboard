import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState, useMemo, useRef } from 'react';
import type React from 'react';
import { ClaudeCharacter } from '../components/ClaudeCharacter';
import { CrawlingClaude } from '../components/CrawlingClaude';
import { QRCodeSVG } from 'qrcode.react';
import { EventHeader } from '../components/EventHeader';
import { SplashOverlay } from '../components/SplashOverlay';
import { WhatsUpClaude } from '../components/WhatsUpClaude';
import { EventSlides } from '../components/EventSlides';
import { WordCloud } from '../components/WordCloud';
import { InterestStream } from '../components/InterestStream';
import { RoomCanvas } from '../components/RoomCanvas';
import { useEvent } from '../data/events/useEvent';
import './Dashboard.css';

const MOBILE_URL = typeof window !== 'undefined' ? `${window.location.origin}/join` : '/join';

const SPEECH_MESSAGES = [
  "Waiting for more humans...",
  "{count} people and counting",
  "Scanning for good vibes",
  "Barcelona + AI = tonight",
  "Tell us what you want to talk about",
];

export function Dashboard({ archiveSlug }: { archiveSlug?: string } = {}) {
  const { config, isArchived } = useEvent(archiveSlug);
  const TARGET_ATTENDEES = config.targetAttendees;
  const slugArg = archiveSlug ? { slug: archiveSlug } : {};

  const attendees = useQuery(api.attendees.getAll, slugArg) ?? [];
  const topics = useQuery(api.topics.getTopicsWithVotes, slugArg) ?? [];
  const recentAttendees = useQuery(api.attendees.getRecent, { limit: 20, ...slugArg }) ?? [];
  const demosData = useQuery(
    api.demos.getDemos,
    config.demosEnabled ? slugArg : 'skip'
  );
  const demos = demosData?.demos ?? [];
  const seedTopics = useMutation(api.topics.seedTopics);

  // Seed the active event's topics once (never seed an archived view).
  useEffect(() => {
    if (!isArchived) seedTopics({ topics: config.seedTopics });
  }, [isArchived, config.slug]);

  const count = attendees.length;
  const pct = Math.round((count / TARGET_ATTENDEES) * 100);

  // Aggregates
  const experienceCounts = useMemo(() => {
    const c = { curious: 0, daily: 0, builder: 0 };
    attendees.forEach((a) => {
      if (a.experienceLevel) c[a.experienceLevel]++;
    });
    return c;
  }, [attendees]);

  // Interest aggregation for page 2
  const interestItems = useMemo(() => {
    return attendees
      .filter((a) => a.interest && a.interest.trim().length > 0)
      .slice()
      .reverse()
      .slice(0, 30)
      .map((a) => ({
        _id: a._id as string,
        name: a.name,
        role: a.role,
        interest: a.interest!,
        interestBucket: a.interestBucket,
      }));
  }, [attendees]);

  const interestBuckets = useMemo(() => {
    const counts = new Map<string, number>();
    attendees.forEach((a) => {
      const b = a.interestBucket;
      if (!b) return;
      counts.set(b, (counts.get(b) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([bucket, count]) => ({ bucket, count }))
      .sort((a, b) => b.count - a.count);
  }, [attendees]);

  // Ticker items
  const tickerItems = useMemo(() => {
    const items: string[] = [];
    recentAttendees.forEach((a) => items.push(`${a.name} just joined`));
    topics.filter((t) => !t.isPreSeeded).slice(0, 5).forEach((t) => items.push(`New topic: ${t.text}`));
    return items.length > 0 ? items : ['Waiting for attendees...'];
  }, [recentAttendees, topics]);

  // Expanded panel state
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showWhatsUp, setShowWhatsUp] = useState(false);
  const [showEventSlides, setShowEventSlides] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  // Page carousel — demo leaderboard adds a 4th page when demos are enabled.
  type Page = number;
  const PAGE_COUNT = config.demosEnabled ? 4 : 3;
  const [page, setPage] = useState<Page>(0);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't grab keys while a modal is open
      if (showSplash || showWhatsUp || showEventSlides || showCredits || expanded) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setPage((p) => ((p + 1) % PAGE_COUNT) as Page); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); setPage((p) => ((p - 1 + PAGE_COUNT) % PAGE_COUNT) as Page); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSplash, showWhatsUp, showEventSlides, showCredits, expanded]);

  // Touch swipe
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0 && page < PAGE_COUNT - 1) setPage((page + 1) as Page);
      else if (dx > 0 && page > 0) setPage((page - 1) as Page);
    }
    touchStartX.current = null;
  }

  // People for the avatar room
  const roomPeople = useMemo(
    () => attendees.map((a) => ({ _id: a._id as string, name: a.name, photoUrl: a.photoUrl ?? null })),
    [attendees]
  );

  return (
    <div className="dashboard">
      <EventHeader
        config={config}
        onTitleClick={() => setShowSplash(true)}
        onWhatsUp={() => setShowWhatsUp(true)}
        onEventSlides={() => setShowEventSlides(true)}
      />
      {showSplash && <SplashOverlay onClose={() => setShowSplash(false)} />}
      {showWhatsUp && <WhatsUpClaude onClose={() => setShowWhatsUp(false)} />}
      {showEventSlides && <EventSlides config={config} onClose={() => setShowEventSlides(false)} />}
      {showCredits && (
        <div className="credits-overlay" onClick={() => setShowCredits(false)}>
          <div className="credits-card" onClick={(e) => e.stopPropagation()}>
            <div className="credits-card__left">
              <div className="credits-card__party">🎉</div>
              <h2 className="credits-card__title">
                Claude for Builders<br />in Barcelona
              </h2>
              <p className="credits-card__sub">
                Sign up by May 20th to get $20 in free API credits to build with Claude.
              </p>
            </div>
            <div className="credits-card__right">
              <img src="/credits-qr.png" alt="Scan to redeem" className="credits-card__qr" />
            </div>
            <div className="credits-card__logo">
              <img src="/logo-claude.svg" alt="Claude" />
            </div>
          </div>
        </div>
      )}
      <div
        className="dashboard__pager"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="dashboard__track" style={{ transform: `translateX(-${page * 100}%)` }}>

          {/* ================= PAGE 1: Room state ================= */}
          <section className="dashboard__page dashboard__grid dashboard__grid--p1">

            {/* Hero QR (left half) */}
            <div className="panel panel--claude panel--qr-hero">
              <SpeechBubble count={count} />
              <ClaudeCharacter size="large" />
              <p className="panel__cta">Scan to join. <strong>Be part of the wall.</strong></p>
              <div className="qr-wrap qr-wrap--hero">
                <QRCodeSVG value={MOBILE_URL} size={320} bgColor="transparent" fgColor="#e8e0d8" level="M" />
              </div>
            </div>

            {/* People Here (top right) */}
            <div className="panel panel--count" onClick={() => setExpanded('count')}>
              <div className="panel__header">
                <span className="panel__label">PEOPLE HERE</span>
                <span className="live-badge"><span className="live-dot" /> Live</span>
              </div>
              <div className="count-display count-display--big">
                <span className="count-display__number">{count}</span>
                <span className="count-display__target">/ {TARGET_ATTENDEES}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="count-label">
                {pct < 30 ? 'Warming up...' : pct < 70 ? 'Filling up nicely' : pct < 95 ? 'Almost there' : 'Full house!'}
              </div>
              <button className="btn-free-credits" onClick={(e) => { e.stopPropagation(); setShowCredits(true); }}>
                🎁 Free API Credits
              </button>
            </div>

            {/* The Room Is (bottom right top) */}
            <div className="panel panel--donut">
              <div className="panel__header">
                <span className="panel__label">THE ROOM IS...</span>
              </div>
              <DonutChart data={experienceCounts} total={count} />
            </div>

          </section>

          {/* ================= PAGE 2: What the room wants to talk about ================= */}
          <section className="dashboard__page dashboard__grid dashboard__grid--p2">

            {/* Word cloud (left, wide) */}
            <div className="panel panel--cloud">
              <div className="panel__header">
                <span className="panel__label">THE ROOM WANTS TO TALK ABOUT…</span>
                <span className="panel__badge">{interestBuckets.reduce((s, b) => s + b.count, 0)} answers</span>
              </div>
              <WordCloud buckets={interestBuckets} />
            </div>

            {/* Live stream (right) */}
            <div className="panel panel--stream">
              <div className="panel__header">
                <span className="panel__label">LIVE</span>
                <span className="live-badge"><span className="live-dot" /> Live</span>
              </div>
              <InterestStream items={interestItems} />
            </div>
          </section>

          {/* ================= PAGE 3: The Room (avatar world) ================= */}
          <section className="dashboard__page dashboard__grid dashboard__grid--p3">
            <div className="panel panel--room">
              <div className="panel__header">
                <span className="panel__label">THE ROOM</span>
                <span className="panel__badge">{roomPeople.length} in the room</span>
              </div>
              <RoomCanvas people={roomPeople} />
            </div>
          </section>

          {/* ================= PAGE 4: Demo leaderboard ================= */}
          {config.demosEnabled && (
            <section className="dashboard__page dashboard__grid dashboard__grid--leaderboard">
              <div className="panel panel--leaderboard">
                <div className="panel__header">
                  <span className="panel__label">TOP DEMOS</span>
                  <span className="live-badge"><span className="live-dot" /> Live</span>
                </div>
                <DemoLeaderboard demos={demos} />
              </div>
            </section>
          )}
        </div>

        {/* Pager dots */}
        <div className="dashboard__pager-dots">
          {Array.from({ length: PAGE_COUNT }).map((_, i) => (
            <button
              key={i}
              className={`dashboard__pager-dot ${i === page ? 'is-active' : ''}`}
              onClick={() => setPage(i as Page)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Crawling Claude — random edge each time */}
      <CrawlingClaude />

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker__track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span className="ticker__item" key={i}>
              <span className="ticker__dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Panel Overlay */}
      {expanded && (
        <div className="expanded-overlay" onClick={() => setExpanded(null)}>
          <div className="expanded-panel" onClick={(e) => e.stopPropagation()}>
            <button className="expanded-close" onClick={() => setExpanded(null)}>✕</button>

            {expanded === 'count' && (
              <div className="expanded-content">
                <h2 className="expanded-title">People Here</h2>
                <div className="count-display" style={{ justifyContent: 'center' }}>
                  <span className="count-display__number" style={{ fontSize: 120 }}>{count}</span>
                  <span className="count-display__target" style={{ fontSize: 40 }}>/ {TARGET_ATTENDEES}</span>
                </div>
                <div className="progress-track" style={{ height: 10, margin: '20px 0' }}>
                  <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="expanded-attendee-list">
                  <h3 className="expanded-subtitle">All Attendees</h3>
                  {attendees.map((a) => (
                    <div className="expanded-attendee-row" key={a._id}>
                      <span className="expanded-attendee-name">{a.name}</span>
                      <span className="expanded-attendee-role">{a.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expanded === 'topics' && (
              <div className="expanded-content">
                <h2 className="expanded-title">Hot Topics</h2>
                <div className="topics-rank" style={{ maxHeight: 'none', gap: 8 }}>
                  {topics.map((topic) => (
                    <div className="topic-rank-row" key={topic._id} style={{ padding: '10px 14px' }}>
                      <span className="topic-rank-row__votes" style={{ fontSize: 28 }}>{topic.voteCount}</span>
                      <span className="topic-rank-row__text" style={{ fontSize: 16 }}>
                        {topic.emoji && <span>{topic.emoji} </span>}
                        {topic.text}
                      </span>
                      {!topic.isPreSeeded && Date.now() - topic.createdAt < 120000 && (
                        <span className="badge-new">NEW</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function SpeechBubble({ count }: { count: number }) {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setMsgIdx((p) => (p + 1) % SPEECH_MESSAGES.length), 4000);
    return () => clearInterval(iv);
  }, []);

  const msg = SPEECH_MESSAGES[msgIdx]
    .replace('{count}', String(count));

  return (
    <div className="speech-bubble" key={msgIdx}>
      {msg}
    </div>
  );
}

type LeaderboardDemo = {
  _id: string;
  projectName: string;
  ogTitle: string | null;
  tagline: string | null;
  builderName: string;
  imageUrl: string | null;
  avatarUrl: string | null;
  voteCount: number;
};

function DemoLeaderboard({ demos }: { demos: LeaderboardDemo[] }) {
  if (demos.length === 0) {
    return (
      <div className="leaderboard__empty">
        <span className="leaderboard__empty-emoji">🎨</span>
        <p>No demos yet. Scan to submit yours at <strong>/demos</strong>.</p>
      </div>
    );
  }
  const medals = ['🥇', '🥈', '🥉'];
  const ranked = [...demos].sort((a, b) => b.voteCount - a.voteCount);
  return (
    <div className="leaderboard">
      {ranked.slice(0, 8).map((d, i) => {
        const title = d.projectName || d.ogTitle || 'Untitled';
        return (
          <div className={`leaderboard__row ${i === 0 ? 'is-leader' : ''}`} key={d._id}>
            <span className="leaderboard__rank">{medals[i] ?? `#${i + 1}`}</span>
            <div className="leaderboard__media">
              {d.imageUrl ? (
                <img src={d.imageUrl} alt={title} />
              ) : (
                <span className="leaderboard__media-fallback">🎨</span>
              )}
            </div>
            <div className="leaderboard__info">
              <span className="leaderboard__name">{title}</span>
              <span className="leaderboard__builder">{d.builderName}</span>
            </div>
            <span className="leaderboard__votes">
              <span className="leaderboard__votes-num">{d.voteCount}</span>
              <span className="leaderboard__votes-label">{d.voteCount === 1 ? 'vote' : 'votes'}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data, total }: { data: { curious: number; daily: number; builder: number }; total: number }) {
  const radius = 56;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { key: 'curious', label: 'Just curious', count: data.curious, color: 'var(--accent-green)' },
    { key: 'daily', label: 'Using daily', count: data.daily, color: 'var(--accent-blue)' },
    { key: 'builder', label: 'Building', count: data.builder, color: 'var(--accent-purple)' },
  ];

  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" className="donut-svg">
        {/* Background circle */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--bg-elevated)" strokeWidth={stroke} />
        {total > 0 && segments.map((seg) => {
          const pct = seg.count / total;
          const dashArray = `${pct * circumference} ${circumference}`;
          const el = (
            <circle
              key={seg.key}
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{ transition: 'all 1.5s cubic-bezier(0.4,0,0.2,1)' }}
            />
          );
          offset += pct * circumference;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" fill="var(--text-primary)" fontFamily="Space Grotesk" fontSize="24" fontWeight="700">{total}</text>
        <text x="70" y="82" textAnchor="middle" fill="var(--text-muted)" fontFamily="JetBrains Mono" fontSize="9">joined</text>
      </svg>
      <div className="donut-legend">
        {segments.map((seg) => (
          <div className="donut-legend__item" key={seg.key}>
            <span className="donut-legend__dot" style={{ background: seg.color }} />
            <span className="donut-legend__label">{seg.label}</span>
            <span className="donut-legend__count">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


