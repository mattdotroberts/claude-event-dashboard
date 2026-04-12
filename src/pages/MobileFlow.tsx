import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { ProgressBar } from '../components/ProgressBar';
import { ClaudeCharacter } from '../components/ClaudeCharacter';
import { EventHeader } from '../components/EventHeader';
import './MobileFlow.css';

const STORAGE_KEY = 'claude-event-attendee-id';

type Screen = 1 | 2 | 3 | 4 | 5 | 'done' | 'revote';

export function MobileFlow() {
  const [screen, setScreen] = useState<Screen>(1);
  const [attendeeId, setAttendeeId] = useState<Id<"attendees"> | null>(null);
  const [attendeeNumber, setAttendeeNumber] = useState<number>(0);
  const [returning, setReturning] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'curious' | 'daily' | 'builder' | ''>('');
  const [location, setLocation] = useState<'local' | 'visiting' | 'temporary' | 'considering' | ''>('');
  const [spicyTake1, setSpicyTake1] = useState<'agree' | 'disagree' | 'drink' | ''>('');
  const [spicyTake2, setSpicyTake2] = useState<'obviously' | 'depends' | 'brave' | ''>('');
  const [offer, setOffer] = useState('');
  const [need, setNeed] = useState('');
  const [confession, setConfession] = useState('');

  const submitAttendee = useMutation(api.attendees.submitAttendee);
  const updateAttendee = useMutation(api.attendees.updateAttendee);
  const attendeeCount = useQuery(api.attendees.getCount);

  // Check localStorage for returning user — capture once on mount
  const [storedId] = useState<string | null>(
    () => (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
  );
  const existingAttendee = useQuery(
    api.attendees.getById,
    storedId ? { id: storedId as Id<"attendees"> } : 'skip'
  );

  // On mount only, if we have a valid stored attendee, go to done screen
  useEffect(() => {
    if (existingAttendee && storedId) {
      setAttendeeId(storedId as Id<"attendees">);
      setName(existingAttendee.name);
      setRole(existingAttendee.role);
      setReturning(true);
      setScreen('done');
    } else if (existingAttendee === null && storedId) {
      // Attendee was deleted — clear stale localStorage
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [existingAttendee, storedId]);

  function saveAttendeeId(id: Id<"attendees">) {
    setAttendeeId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  const currentProgress = screen === 'done' || screen === 'revote' ? 5 : (screen as number);

  async function handleSubmitAll() {
    if (!experienceLevel || !location || !spicyTake1 || !spicyTake2) return;
    try {
      const id = await submitAttendee({
        name,
        role,
        experienceLevel,
        location,
        spicyTake1,
        spicyTake2,
        offer,
        need,
        confession: confession.trim() || undefined,
      });
      saveAttendeeId(id);
      setAttendeeNumber((attendeeCount ?? 0) + 1);
      setScreen('done');
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mobile">
      <EventHeader compact />
      {screen !== 'done' && screen !== 'revote' && <ProgressBar current={currentProgress} total={5} />}

      <div className="mobile__content">
        {screen === 1 && (
          <Screen1
            name={name} setName={setName}
            role={role} setRole={setRole}
            onNext={() => setScreen(2)}
          />
        )}
        {screen === 2 && (
          <Screen2
            experienceLevel={experienceLevel} setExperienceLevel={setExperienceLevel}
            location={location} setLocation={setLocation}
            onNext={() => setScreen(3)}
          />
        )}
        {screen === 3 && (
          <Screen3
            spicyTake1={spicyTake1} setSpicyTake1={setSpicyTake1}
            spicyTake2={spicyTake2} setSpicyTake2={setSpicyTake2}
            onNext={() => setScreen(4)}
          />
        )}
        {screen === 4 && (
          <Screen4
            attendeeId={attendeeId}
            onNext={() => setScreen(5)}
            onSubmitIdentity={async () => {
              if (!experienceLevel || !location || !spicyTake1 || !spicyTake2) return;
              const id = await submitAttendee({
                name,
                role,
                experienceLevel,
                location,
                spicyTake1,
                spicyTake2,
                offer: 'TBD',
                need: 'TBD',
              });
              saveAttendeeId(id);
              return id;
            }}
          />
        )}
        {screen === 5 && (
          <Screen5
            confession={confession} setConfession={setConfession}
            onSubmit={async () => {
              if (attendeeId) {
                await updateAttendee({
                  id: attendeeId,
                  offer: offer || undefined,
                  need: need || undefined,
                  confession: confession.trim() || undefined,
                });
                setAttendeeNumber((attendeeCount ?? 0));
                setScreen('done');
              } else {
                await handleSubmitAll();
              }
            }}
            onSkip={async () => {
              setConfession('');
              if (attendeeId) {
                await updateAttendee({
                  id: attendeeId,
                  offer: offer || undefined,
                  need: need || undefined,
                });
                setAttendeeNumber((attendeeCount ?? 0));
                setScreen('done');
              } else {
                handleSubmitAll();
              }
            }}
          />
        )}
        {screen === 'done' && (
          <ScreenDone
            number={attendeeNumber}
            name={name}
            returning={returning}
            onChangeVotes={() => setScreen('revote')}
          />
        )}
        {screen === 'revote' && attendeeId && (
          <ScreenRevote
            attendeeId={attendeeId}
            onDone={() => setScreen('done')}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Screen 1: Welcome ---------- */
function Screen1({ name, setName, role, setRole, onNext }: {
  name: string; setName: (v: string) => void;
  role: string; setRole: (v: string) => void;
  onNext: () => void;
}) {
  const valid = name.trim() && role.trim();
  return (
    <div className="screen screen--welcome">
      <ClaudeCharacter size="small" />
      <h1 className="screen__title">Claude for Everyone</h1>
      <p className="screen__subtitle">5 quick taps. 90 seconds. Your answers appear on the big screen.</p>
      <div className="screen__fields">
        <input
          className="input"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <input
          className="input"
          placeholder="What do you do? e.g. Product Manager at Acme"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>
      <button className="btn btn--primary" disabled={!valid} onClick={onNext}>
        Let's go →
      </button>
    </div>
  );
}

/* ---------- Screen 2: About You ---------- */
function Screen2({ experienceLevel, setExperienceLevel, location, setLocation, onNext }: {
  experienceLevel: string; setExperienceLevel: (v: 'curious' | 'daily' | 'builder') => void;
  location: string; setLocation: (v: 'local' | 'visiting' | 'temporary' | 'considering') => void;
  onNext: () => void;
}) {
  const valid = experienceLevel && location;
  return (
    <div className="screen">
      <label className="screen__label">Where are you with AI?</label>
      <div className="option-cards">
        <OptionCard emoji="🌱" title="Just curious" desc="Here to learn what's possible" selected={experienceLevel === 'curious'} onClick={() => setExperienceLevel('curious')} />
        <OptionCard emoji="⚡" title="Using it daily" desc="AI is part of my workflow" selected={experienceLevel === 'daily'} onClick={() => setExperienceLevel('daily')} />
        <OptionCard emoji="🛠️" title="Building with it" desc="Agents, automations, products" selected={experienceLevel === 'builder'} onClick={() => setExperienceLevel('builder')} />
      </div>

      <label className="screen__label" style={{ marginTop: 20 }}>Barcelona and you?</label>
      <div className="option-cards">
        <OptionCard emoji="🏠" title="I live here" desc="Barcelona is home" selected={location === 'local'} onClick={() => setLocation('local')} />
        <OptionCard emoji="✈️" title="Passing through" desc="Visiting or on a trip" selected={location === 'visiting'} onClick={() => setLocation('visiting')} />
        <OptionCard emoji="🧳" title="Here temporarily" desc="A few weeks or months" selected={location === 'temporary'} onClick={() => setLocation('temporary')} />
        <OptionCard emoji="🤔" title="Thinking of moving" desc="Scouting it out" selected={location === 'considering'} onClick={() => setLocation('considering')} />
      </div>

      <button className="btn btn--primary" disabled={!valid} onClick={onNext}>
        Next →
      </button>
    </div>
  );
}

function OptionCard({ emoji, title, desc, selected, onClick }: {
  emoji: string; title: string; desc: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button className={`option-card ${selected ? 'option-card--selected' : ''}`} onClick={onClick}>
      <span className="option-card__emoji">{emoji}</span>
      <div>
        <div className="option-card__title">{title}</div>
        <div className="option-card__desc">{desc}</div>
      </div>
    </button>
  );
}

/* ---------- Screen 3: Spicy Takes ---------- */
function Screen3({ spicyTake1, setSpicyTake1, spicyTake2, setSpicyTake2, onNext }: {
  spicyTake1: string; setSpicyTake1: (v: 'agree' | 'disagree' | 'drink') => void;
  spicyTake2: string; setSpicyTake2: (v: 'obviously' | 'depends' | 'brave') => void;
  onNext: () => void;
}) {
  const valid = spicyTake1 && spicyTake2;
  return (
    <div className="screen">
      <div className="spicy-block">
        <p className="spicy-block__statement">🌶️ "Learning to code in 2026 is a waste of time"</p>
        <div className="reaction-buttons">
          <ReactionBtn emoji="👍" label="Agree" selected={spicyTake1 === 'agree'} onClick={() => setSpicyTake1('agree')} />
          <ReactionBtn emoji="👎" label="Disagree" selected={spicyTake1 === 'disagree'} onClick={() => setSpicyTake1('disagree')} />
          <ReactionBtn emoji="🍷" label="Ask me after a drink" selected={spicyTake1 === 'drink'} onClick={() => setSpicyTake1('drink')} />
        </div>
      </div>

      <div className="spicy-block">
        <p className="spicy-block__statement">🤖 "Agents will replace managers before they replace engineers"</p>
        <div className="reaction-buttons">
          <ReactionBtn emoji="🔥" label="Obviously" selected={spicyTake2 === 'obviously'} onClick={() => setSpicyTake2('obviously')} />
          <ReactionBtn emoji="🤷" label="Depends" selected={spicyTake2 === 'depends'} onClick={() => setSpicyTake2('depends')} />
          <ReactionBtn emoji="😬" label="Brave room to say no" selected={spicyTake2 === 'brave'} onClick={() => setSpicyTake2('brave')} />
        </div>
      </div>

      <button className="btn btn--primary" disabled={!valid} onClick={onNext}>
        Next →
      </button>
    </div>
  );
}

function ReactionBtn({ emoji, label, selected, onClick }: {
  emoji: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button className={`reaction-btn ${selected ? 'reaction-btn--selected' : ''}`} onClick={onClick}>
      <span>{emoji}</span> {label}
    </button>
  );
}

/* ---------- Screen 4: Topics ---------- */
function Screen4({ attendeeId, onNext, onSubmitIdentity }: {
  attendeeId: Id<"attendees"> | null;
  onNext: () => void;
  onSubmitIdentity: () => Promise<Id<"attendees"> | undefined>;
}) {
  const [localAttendeeId, setLocalAttendeeId] = useState<Id<"attendees"> | null>(attendeeId);
  const [newTopic, setNewTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const topics = useQuery(api.topics.getTopicsWithVotes);
  const myVotes = useQuery(
    api.topics.getVotesForAttendee,
    localAttendeeId ? { attendeeId: localAttendeeId } : 'skip'
  );
  const voteMutation = useMutation(api.topics.vote);
  const unvoteMutation = useMutation(api.topics.unvote);
  const proposeMutation = useMutation(api.topics.proposeTopic);
  const seedMutation = useMutation(api.topics.seedTopics);

  useEffect(() => { seedMutation(); }, []);

  const votedIds = new Set(myVotes ?? []);
  const voteCount = votedIds.size;

  async function ensureAttendee(): Promise<Id<"attendees"> | null> {
    if (localAttendeeId) return localAttendeeId;
    setSubmitting(true);
    try {
      const id = await onSubmitIdentity();
      if (id) {
        setLocalAttendeeId(id);
        return id;
      }
    } finally {
      setSubmitting(false);
    }
    return null;
  }

  async function handleVote(topicId: Id<"topics">) {
    const aid = await ensureAttendee();
    if (!aid) return;

    if (votedIds.has(topicId)) {
      await unvoteMutation({ topicId, attendeeId: aid });
    } else if (voteCount < 2) {
      await voteMutation({ topicId, attendeeId: aid });
    }
  }

  async function handlePropose() {
    if (!newTopic.trim()) return;
    const aid = await ensureAttendee();
    if (!aid) return;
    await proposeMutation({ text: newTopic.trim(), attendeeId: aid });
    setNewTopic('');
  }

  return (
    <div className="screen screen--topics">
      <label className="screen__label">What should we discuss tonight?</label>
      <div className="vote-counter">{voteCount}/2 votes used</div>

      <div className="topics-list">
        {(topics ?? []).map((topic) => (
          <button
            key={topic._id}
            className={`topic-row ${votedIds.has(topic._id) ? 'topic-row--voted' : ''}`}
            onClick={() => handleVote(topic._id)}
            disabled={submitting}
          >
            <span className="topic-row__text">
              {topic.emoji && <span className="topic-row__emoji">{topic.emoji}</span>}
              {topic.text}
            </span>
            <span className="topic-row__votes">{topic.voteCount}</span>
          </button>
        ))}
      </div>

      <div className="propose-row">
        <input
          className="input input--small"
          placeholder="Or propose your own..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePropose()}
        />
        <button className="btn btn--small" onClick={handlePropose} disabled={!newTopic.trim()}>+</button>
      </div>

      <button className="btn btn--primary" onClick={onNext}>
        Almost done →
      </button>
    </div>
  );
}

/* ---------- Screen 5: Confession ---------- */
function Screen5({ confession, setConfession, onSubmit, onSkip }: {
  confession: string; setConfession: (v: string) => void;
  onSubmit: () => void; onSkip: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await onSubmit();
  }

  return (
    <div className="screen">
      <div className="screen__emoji">🤫</div>
      <h2 className="screen__title">AI Confession</h2>
      <p className="screen__subtitle">Anonymous. No one will know. Unless it's obvious.</p>
      <textarea
        className="textarea"
        maxLength={140}
        placeholder="I once spent 3 hours arguing with Claude about whether my code was wrong. Claude was right."
        value={confession}
        onChange={(e) => setConfession(e.target.value)}
      />
      <div className="char-count">{confession.length}/140</div>
      <button className="btn btn--primary" onClick={handleSubmit} disabled={submitting || !confession.trim()}>
        Confess + Finish 🎉
      </button>
      <button className="btn btn--ghost" onClick={onSkip} disabled={submitting}>
        Skip, I'm innocent
      </button>
    </div>
  );
}

/* ---------- Done Screen ---------- */
const POWERED_BY = [
  { src: '/logo-claude.svg', alt: 'Claude', url: 'https://claude.ai', className: 'powered-logo--claude' },
  { src: '/logo-aisummit-full.svg', alt: 'AI Summit Barcelona', url: 'https://aisummitbarcelona.com', className: 'powered-logo--aisummit' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/WTCB_Logo.svg', alt: 'WTC Barcelona', url: 'https://www.wtcbarcelona.com', className: 'powered-logo--wtcb' },
  { src: '/logo-happy-operators.png', alt: 'Happy Operators', url: 'https://www.happyoperators.com/community', className: 'powered-logo--hapi' },
];

function ScreenDone({ number, name, returning, onChangeVotes }: {
  number: number;
  name: string;
  returning: boolean;
  onChangeVotes: () => void;
}) {
  return (
    <div className="screen screen--done">
      <ClaudeCharacter size="medium" />
      {returning ? (
        <>
          <h1 className="screen__title">Welcome back, {name}!</h1>
          <p className="screen__subtitle">You're already on the wall. Want to update your topic votes?</p>
        </>
      ) : (
        <>
          <h1 className="screen__title">You're on the wall!</h1>
          <p className="screen__subtitle">Your answers are live on the big screen. Put your phone away and go find someone interesting to talk to.</p>
        </>
      )}
      <div className="look-up">
        <div className="look-up__arrow">👆</div>
        <p>Look up at the screen</p>
      </div>
      {number > 0 && (
        <div className="attendee-badge">
          You're attendee #{number}
        </div>
      )}

      <button className="btn btn--ghost btn--change-votes" onClick={onChangeVotes}>
        🗳️ Change my topic votes
      </button>

      <div className="powered-by">
        <span className="powered-by__label">Powered by</span>
        <div className="powered-by__logos">
          {POWERED_BY.map((logo) => (
            <a key={logo.alt} href={logo.url} target="_blank" rel="noopener noreferrer">
              <img src={logo.src} alt={logo.alt} className={`powered-logo ${logo.className}`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Revote Screen ---------- */
function ScreenRevote({ attendeeId, onDone }: {
  attendeeId: Id<"attendees">;
  onDone: () => void;
}) {
  const [newTopic, setNewTopic] = useState('');

  const topics = useQuery(api.topics.getTopicsWithVotes);
  const myVotes = useQuery(api.topics.getVotesForAttendee, { attendeeId });
  const voteMutation = useMutation(api.topics.vote);
  const unvoteMutation = useMutation(api.topics.unvote);
  const proposeMutation = useMutation(api.topics.proposeTopic);

  const votedIds = new Set(myVotes ?? []);
  const voteCount = votedIds.size;

  async function handleVote(topicId: Id<"topics">) {
    if (votedIds.has(topicId)) {
      await unvoteMutation({ topicId, attendeeId });
    } else if (voteCount < 2) {
      await voteMutation({ topicId, attendeeId });
    }
  }

  async function handlePropose() {
    if (!newTopic.trim()) return;
    await proposeMutation({ text: newTopic.trim(), attendeeId });
    setNewTopic('');
  }

  return (
    <div className="screen screen--topics">
      <h2 className="screen__title" style={{ fontSize: 20 }}>Change Your Votes</h2>
      <p className="screen__subtitle">Tap to vote or unvote. You get 2 votes.</p>
      <div className="vote-counter">{voteCount}/2 votes used</div>

      <div className="topics-list topics-list--tall">
        {(topics ?? []).map((topic) => (
          <button
            key={topic._id}
            className={`topic-row ${votedIds.has(topic._id) ? 'topic-row--voted' : ''}`}
            onClick={() => handleVote(topic._id)}
          >
            <span className="topic-row__text">
              {topic.emoji && <span className="topic-row__emoji">{topic.emoji}</span>}
              {topic.text}
            </span>
            <span className="topic-row__votes">{topic.voteCount}</span>
          </button>
        ))}
      </div>

      <div className="propose-row">
        <input
          className="input input--small"
          placeholder="Or propose your own..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePropose()}
        />
        <button className="btn btn--small" onClick={handlePropose} disabled={!newTopic.trim()}>+</button>
      </div>

      <button className="btn btn--primary" onClick={onDone}>
        ← Back to wall
      </button>
    </div>
  );
}
