import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState, useMemo } from 'react';
import { ClaudeCharacter } from '../components/ClaudeCharacter';
import { CrawlingClaude } from '../components/CrawlingClaude';
import { QRCodeSVG } from 'qrcode.react';
import { EventHeader } from '../components/EventHeader';
import { SplashOverlay } from '../components/SplashOverlay';
import { WhatsUpClaude } from '../components/WhatsUpClaude';
import './Dashboard.css';

const TARGET_ATTENDEES = 60;
const MOBILE_URL = typeof window !== 'undefined' ? `${window.location.origin}/join` : '/join';

const SPEECH_MESSAGES = [
  "Waiting for more humans...",
  "{count} people and counting",
  "Someone just confessed something",
  "This room is {spicy}% spicy",
  "Scanning for good vibes",
  "Processing hot takes",
  "Barcelona + AI = tonight",
];

export function Dashboard() {
  const attendees = useQuery(api.attendees.getAll) ?? [];
  const topics = useQuery(api.topics.getTopicsWithVotes) ?? [];
  const recentAttendees = useQuery(api.attendees.getRecent, { limit: 20 }) ?? [];
  const seedTopics = useMutation(api.topics.seedTopics);

  useEffect(() => { seedTopics(); }, []);

  const count = attendees.length;
  const pct = Math.round((count / TARGET_ATTENDEES) * 100);

  // Aggregates
  const experienceCounts = useMemo(() => {
    const c = { curious: 0, daily: 0, builder: 0 };
    attendees.forEach((a) => { c[a.experienceLevel]++; });
    return c;
  }, [attendees]);

  const locationCounts = useMemo(() => {
    const c = { local: 0, visiting: 0, temporary: 0, considering: 0 };
    attendees.forEach((a) => { c[a.location]++; });
    return c;
  }, [attendees]);

  const spicy1 = useMemo(() => {
    const c = { agree: 0, disagree: 0, drink: 0 };
    attendees.forEach((a) => { c[a.spicyTake1]++; });
    return c;
  }, [attendees]);

  const spicy2 = useMemo(() => {
    const c = { obviously: 0, depends: 0, brave: 0 };
    attendees.forEach((a) => { c[a.spicyTake2]++; });
    return c;
  }, [attendees]);

  const confessions = useMemo(
    () => attendees.filter((a) => a.confession).map((a) => a.confession!).reverse().slice(0, 3),
    [attendees]
  );

  const totalSpicy = spicy1.agree + spicy1.disagree + spicy1.drink;
  const spicyPct = totalSpicy > 0 ? Math.round((spicy1.agree / totalSpicy) * 100) : 0;

  // Cycling spicy take display
  const [showTake, setShowTake] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setShowTake((p) => (p + 1) % 2), 10000);
    return () => clearInterval(iv);
  }, []);

  // Ticker items
  const tickerItems = useMemo(() => {
    const items: string[] = [];
    recentAttendees.forEach((a) => items.push(`${a.name} just joined`));
    topics.filter((t) => !t.isPreSeeded).slice(0, 5).forEach((t) => items.push(`New topic: ${t.text}`));
    if (confessions.length > 0) items.push('New confession 👀');
    return items.length > 0 ? items : ['Waiting for attendees...'];
  }, [recentAttendees, topics, confessions]);

  // Expanded panel state
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showWhatsUp, setShowWhatsUp] = useState(false);

  return (
    <div className="dashboard">
      <EventHeader onTitleClick={() => setShowSplash(true)} onWhatsUp={() => setShowWhatsUp(true)} />
      {showSplash && <SplashOverlay onClose={() => setShowSplash(false)} />}
      {showWhatsUp && <WhatsUpClaude onClose={() => setShowWhatsUp(false)} />}
      <div className="dashboard__grid">
        {/* Panel 1: People Here */}
        <div className="panel panel--count" onClick={() => setExpanded('count')}>
          <div className="panel__header">
            <span className="panel__label">PEOPLE HERE</span>
            <span className="live-badge"><span className="live-dot" /> Live</span>
          </div>
          <div className="count-display">
            <span className="count-display__number">{count}</span>
            <span className="count-display__target">/ {TARGET_ATTENDEES}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div className="count-label">
            {pct < 30 ? 'Warming up...' : pct < 70 ? 'Filling up nicely' : pct < 95 ? 'Almost there' : 'Full house!'}
          </div>
        </div>

        {/* Panel 2: Claude + QR */}
        <div className="panel panel--claude">
          <SpeechBubble count={count} spicyPct={spicyPct} />
          <ClaudeCharacter size="large" />
          <p className="panel__cta">Scan to join. <strong>Be part of the wall.</strong></p>
          <div className="qr-wrap">
            <QRCodeSVG value={MOBILE_URL} size={100} bgColor="transparent" fgColor="#e8e0d8" level="M" />
          </div>
        </div>

        {/* Panel 3: Experience donut */}
        <div className="panel panel--donut">
          <div className="panel__header">
            <span className="panel__label">THE ROOM IS...</span>
          </div>
          <DonutChart data={experienceCounts} total={count} />
        </div>

        {/* Panel 4: Spicy Takes (2-col) */}
        <div className="panel panel--spicy" onClick={() => setExpanded('spicy')}>
          <div className="panel__header">
            <span className="panel__label">SPICY TAKES</span>
            <span className="panel__badge">{totalSpicy} votes</span>
          </div>
          {showTake === 0 ? (
            <SpicyPoll
              statement='🌶️ "AI will replace more jobs than the internet created"'
              options={[
                { label: '👍 Agree', count: spicy1.agree, color: 'var(--claude-orange)' },
                { label: '👎 Disagree', count: spicy1.disagree, color: 'var(--accent-blue)' },
                { label: '🍷 After a drink', count: spicy1.drink, color: 'var(--accent-purple)' },
              ]}
              total={totalSpicy}
            />
          ) : (
            <SpicyPoll
              statement='🤖 "Claude is better than ChatGPT"'
              options={[
                { label: '🔥 Obviously', count: spicy2.obviously, color: 'var(--claude-orange)' },
                { label: '🤷 Depends', count: spicy2.depends, color: 'var(--accent-blue)' },
                { label: '😬 Brave to say no', count: spicy2.brave, color: 'var(--accent-purple)' },
              ]}
              total={spicy2.obviously + spicy2.depends + spicy2.brave}
            />
          )}
        </div>

        {/* Panel 5: Hot Topics */}
        <div className="panel panel--topics" onClick={() => setExpanded('topics')}>
          <div className="panel__header">
            <span className="panel__label">HOT TOPICS</span>
            <span className="panel__badge">{topics.reduce((s, t) => s + t.voteCount, 0)} total votes</span>
          </div>
          <div className="topics-rank">
            {topics.slice(0, 6).map((topic, i) => (
              <div className="topic-rank-row" key={topic._id}>
                <span className="topic-rank-row__votes">{topic.voteCount}</span>
                <span className="topic-rank-row__text">
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

        {/* Panel 6: Barcelona + You */}
        <div className="panel panel--location" onClick={() => setExpanded('location')}>
          <div className="panel__header">
            <span className="panel__label">BARCELONA + YOU</span>
          </div>
          <LocationBars data={locationCounts} total={count} />
        </div>

        {/* Panel 7: Confessions (2-col) */}
        <div className="panel panel--confessions" onClick={() => setExpanded('confessions')}>
          <div className="panel__header">
            <span className="panel__label">AI CONFESSIONS</span>
            <span className="panel__badge">Anonymous</span>
          </div>
          <div className="confessions-feed">
            {confessions.length === 0 && (
              <div className="confession-card confession-card--empty">Waiting for confessions...</div>
            )}
            {confessions.map((c, i) => (
              <div className="confession-card" key={i}>
                <p>{c}</p>
              </div>
            ))}
          </div>
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

            {expanded === 'spicy' && (
              <div className="expanded-content">
                <h2 className="expanded-title">Spicy Takes</h2>
                <div style={{ marginBottom: 32 }}>
                  <SpicyPoll
                    statement='🌶️ "AI will replace more jobs than the internet created"'
                    options={[
                      { label: '👍 Agree', count: spicy1.agree, color: 'var(--claude-orange)' },
                      { label: '👎 Disagree', count: spicy1.disagree, color: 'var(--accent-blue)' },
                      { label: '🍷 After a drink', count: spicy1.drink, color: 'var(--accent-purple)' },
                    ]}
                    total={totalSpicy}
                  />
                </div>
                <SpicyPoll
                  statement='🤖 "Claude is better than ChatGPT"'
                  options={[
                    { label: '🔥 Obviously', count: spicy2.obviously, color: 'var(--claude-orange)' },
                    { label: '🤷 Depends', count: spicy2.depends, color: 'var(--accent-blue)' },
                    { label: '😬 Brave to say no', count: spicy2.brave, color: 'var(--accent-purple)' },
                  ]}
                  total={spicy2.obviously + spicy2.depends + spicy2.brave}
                />
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

            {expanded === 'location' && (
              <div className="expanded-content">
                <h2 className="expanded-title">Barcelona + You</h2>
                <LocationBars data={locationCounts} total={count} />
              </div>
            )}

            {expanded === 'confessions' && (
              <div className="expanded-content">
                <h2 className="expanded-title">AI Confessions</h2>
                <div className="confessions-feed" style={{ maxHeight: 'none' }}>
                  {attendees.filter((a) => a.confession).reverse().map((a, i) => (
                    <div className="confession-card" key={i}>
                      <p>{a.confession}</p>
                    </div>
                  ))}
                  {attendees.filter((a) => a.confession).length === 0 && (
                    <div className="confession-card confession-card--empty">No confessions yet...</div>
                  )}
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

function SpeechBubble({ count, spicyPct }: { count: number; spicyPct: number }) {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setMsgIdx((p) => (p + 1) % SPEECH_MESSAGES.length), 4000);
    return () => clearInterval(iv);
  }, []);

  const msg = SPEECH_MESSAGES[msgIdx]
    .replace('{count}', String(count))
    .replace('{spicy}', String(spicyPct));

  return (
    <div className="speech-bubble" key={msgIdx}>
      {msg}
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

function SpicyPoll({ statement, options, total }: {
  statement: string;
  options: { label: string; count: number; color: string }[];
  total: number;
}) {
  return (
    <div className="spicy-poll" key={statement}>
      <p className="spicy-poll__statement">{statement}</p>
      <div className="spicy-poll__bars">
        {options.map((opt) => {
          const pct = total > 0 ? Math.round((opt.count / total) * 100) : 0;
          return (
            <div className="poll-bar" key={opt.label}>
              <span className="poll-bar__label">{opt.label}</span>
              <div className="poll-bar__track">
                <div className="poll-bar__fill" style={{ width: `${pct}%`, background: opt.color, transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)' }}>
                  {pct > 5 && <span className="poll-bar__pct">{pct}%</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocationBars({ data, total }: {
  data: { local: number; visiting: number; temporary: number; considering: number };
  total: number;
}) {
  const rows = [
    { emoji: '🏠', label: 'Live here', count: data.local, color: 'var(--claude-orange)' },
    { emoji: '✈️', label: 'Passing through', count: data.visiting, color: 'var(--accent-blue)' },
    { emoji: '🧳', label: 'Here temporarily', count: data.temporary, color: 'var(--accent-purple)' },
    { emoji: '🤔', label: 'Thinking of moving', count: data.considering, color: 'var(--accent-green)' },
  ];
  return (
    <div className="location-bars">
      {rows.map((row) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        return (
          <div className="location-row" key={row.label}>
            <span className="location-row__label">{row.emoji} {row.label}</span>
            <div className="location-row__track">
              <div className="location-row__fill" style={{ width: `${pct}%`, background: row.color, transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <span className="location-row__count">{row.count}</span>
          </div>
        );
      })}
    </div>
  );
}
