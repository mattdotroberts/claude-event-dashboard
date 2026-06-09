import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { EventHeader } from '../components/EventHeader';
import { useEvent } from '../data/events/useEvent';
import './Admin.css';

// NOTE: client-side gate only. The password ships in the JS bundle and is
// visible in the URL — this is casual gating to keep the admin UI out of
// reach, NOT real access control. The mutations themselves remain open.
const ADMIN_KEY = 'RafaMatt2026';

export function Admin() {
  const params = new URLSearchParams(window.location.search);
  const [authed, setAuthed] = useState(params.get('key') === ADMIN_KEY);

  if (!authed) {
    return <AdminGate onUnlock={() => setAuthed(true)} />;
  }
  return <AdminInner />;
}

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('');
  const [wrong, setWrong] = useState(false);

  function submit() {
    if (pw === ADMIN_KEY) {
      // Put the key in the URL so a refresh / bookmark keeps access.
      const url = new URL(window.location.href);
      url.searchParams.set('key', pw);
      window.history.replaceState({}, '', url.toString());
      onUnlock();
    } else {
      setWrong(true);
    }
  }

  return (
    <div className="admin">
      <EventHeader />
      <div className="admin__content" style={{ maxWidth: 360, marginTop: 80 }}>
        <h1 className="admin__title">Admin access</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
          Enter the admin password to continue.
        </p>
        <input
          className="admin__input"
          type="password"
          value={pw}
          autoFocus
          placeholder="Password"
          onChange={(e) => { setPw(e.target.value); setWrong(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          style={{ width: '100%', marginBottom: 12 }}
        />
        {wrong && <p className="admin__error" style={{ color: 'var(--claude-orange)', fontSize: 13, marginBottom: 12 }}>Wrong password.</p>}
        <button className="admin__btn admin__btn--approve" onClick={submit}>Unlock →</button>
      </div>
    </div>
  );
}

function AdminInner() {
  const { config, event } = useEvent();
  const topics = useQuery(api.topics.getAllTopicsWithVotes, {}) ?? [];
  const attendees = useQuery(api.attendees.getAll, {}) ?? [];
  const allEvents = useQuery(api.events.list) ?? [];
  const demos = useQuery(api.demos.getDemosAdmin, config.demosEnabled ? {} : 'skip') ?? [];
  const approveMutation = useMutation(api.topics.approveTopic);
  const rejectMutation = useMutation(api.topics.rejectTopic);
  const clearAttendees = useMutation(api.attendees.clearAll);
  const clearTopics = useMutation(api.topics.clearAll);
  const updateAttendee = useMutation(api.attendees.updateAttendeeAsAdmin);
  const deleteAttendee = useMutation(api.attendees.deleteAttendee);
  const startNextEvent = useMutation(api.events.startNextEvent);
  const setDemoHidden = useMutation(api.demos.setHidden);
  const deleteDemo = useMutation(api.demos.deleteDemo);

  const pending = topics.filter((t) => !t.approved);
  const approved = topics.filter((t) => t.approved);
  const archived = allEvents.filter((e) => e.isArchived);

  async function handleReset() {
    if (!confirm('⚠️ This clears attendees, topics, and votes for the CURRENT event only. Archived events are untouched. Continue?')) return;
    await clearAttendees();
    await clearTopics();
  }

  async function handleStartNext() {
    const slug = prompt('New event slug (e.g. "design-jul15"). Add a matching config in src/data/events/.');
    if (!slug) return;
    const name = prompt('Event name (e.g. "Claude for X")') ?? slug;
    const date = prompt('Event date (e.g. "15 July 2026")') ?? '';
    if (!confirm(`This archives "${event?.name ?? config.title}" to /prev and starts a fresh empty event "${name}". The previous data is preserved. Continue?`)) return;
    try {
      await startNextEvent({ slug, name, date });
      alert(`Started "${name}". The previous event is now at /prev/${event?.slug ?? config.slug}/dashboard`);
    } catch (err) {
      alert(`Failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <div className="admin">
      <EventHeader />
      <div className="admin__content">
        <h1 className="admin__title">Topic Moderation</h1>

        <section className="admin__section">
          <h2 className="admin__section-title">
            <span className="admin__dot admin__dot--approved" />
            Host
          </h2>
          <a
            href="/speakers"
            target="_blank"
            rel="noopener noreferrer"
            className="admin__btn admin__btn--approve"
            style={{ textDecoration: 'none', display: 'inline-block', marginRight: 8 }}
          >
            🎤 Speaker notes →
          </a>
          <a
            href="/run-of-show"
            target="_blank"
            rel="noopener noreferrer"
            className="admin__btn admin__btn--approve"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            📋 Run of show →
          </a>
          {config.demosEnabled && (
            <a
              href="/demos"
              target="_blank"
              rel="noopener noreferrer"
              className="admin__btn admin__btn--approve"
              style={{ textDecoration: 'none', display: 'inline-block', marginLeft: 8 }}
            >
              🎨 Demo directory →
            </a>
          )}
        </section>

        <section className="admin__section">
          <h2 className="admin__section-title">
            <span className="admin__dot admin__dot--approved" />
            Event — {event?.name ?? config.title}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            Active event: <strong>{config.title}</strong> · {config.date}.
            Starting the next event archives this one to <code>/prev</code> (data preserved) and creates a fresh empty event.
          </p>
          <button className="admin__btn admin__btn--approve" onClick={handleStartNext}>
            🎬 Start next event…
          </button>
          {archived.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                Previous events
              </h3>
              <div className="admin__list">
                {archived.map((e) => (
                  <div className="admin__card" key={e._id}>
                    <div className="admin__card-info">
                      <span className="admin__card-text">{e.name}</span>
                      <span className="admin__card-meta">{e.date}</span>
                    </div>
                    <div className="admin__card-actions">
                      <a
                        href={`/prev/${e.slug}/dashboard`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin__btn admin__btn--approve"
                        style={{ textDecoration: 'none' }}
                      >
                        View dashboard →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {config.demosEnabled && (
          <section className="admin__section">
            <h2 className="admin__section-title">
              <span className="admin__dot admin__dot--approved" />
              Demo Submissions ({demos.length})
            </h2>
            <div className="admin__list">
              {demos.map((d) => (
                <div className={`admin__card ${d.hidden ? 'admin__card--pending' : ''}`} key={d._id}>
                  <div className="admin__card-info">
                    <span className="admin__card-text">
                      {d.projectName} · {d.voteCount} vote{d.voteCount !== 1 ? 's' : ''}
                      {d.hidden && ' · HIDDEN'}
                    </span>
                    <span className="admin__card-meta">
                      {d.builderName} · {d.email} · <a href={d.projectUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>{d.projectUrl}</a>
                    </span>
                  </div>
                  <div className="admin__card-actions">
                    <button
                      className="admin__btn admin__btn--approve"
                      onClick={() => setDemoHidden({ demoId: d._id, hidden: !d.hidden })}
                    >
                      {d.hidden ? 'Unhide' : 'Hide'}
                    </button>
                    <button
                      className="admin__btn admin__btn--reject"
                      onClick={() => { if (confirm(`Delete "${d.projectName}"?`)) deleteDemo({ demoId: d._id }); }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {demos.length === 0 && (
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No demos submitted yet.</p>
              )}
            </div>
          </section>
        )}


        {pending.length > 0 && (
          <section className="admin__section">
            <h2 className="admin__section-title">
              <span className="admin__dot admin__dot--pending" />
              Pending Approval ({pending.length})
            </h2>
            <div className="admin__list">
              {pending.map((topic) => (
                <div className="admin__card admin__card--pending" key={topic._id}>
                  <div className="admin__card-info">
                    <span className="admin__card-text">{topic.text}</span>
                    <span className="admin__card-meta">{topic.voteCount} vote{topic.voteCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="admin__card-actions">
                    <button
                      className="admin__btn admin__btn--approve"
                      onClick={() => approveMutation({ topicId: topic._id })}
                    >
                      Approve
                    </button>
                    <button
                      className="admin__btn admin__btn--reject"
                      onClick={() => rejectMutation({ topicId: topic._id })}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {pending.length === 0 && (
          <div className="admin__empty">
            <span className="admin__empty-icon">✅</span>
            <p>No topics pending approval</p>
          </div>
        )}

        <section className="admin__section">
          <h2 className="admin__section-title">
            <span className="admin__dot admin__dot--approved" />
            Approved Topics ({approved.length})
          </h2>
          <div className="admin__list">
            {approved.map((topic) => (
              <div className="admin__card" key={topic._id}>
                <div className="admin__card-info">
                  <span className="admin__card-text">
                    {topic.emoji && <span>{topic.emoji} </span>}
                    {topic.text}
                  </span>
                  <span className="admin__card-meta">
                    {topic.voteCount} vote{topic.voteCount !== 1 ? 's' : ''}
                    {topic.isPreSeeded && ' · Pre-seeded'}
                  </span>
                </div>
                <div className="admin__card-actions">
                  <button
                    className="admin__btn admin__btn--reject"
                    onClick={() => rejectMutation({ topicId: topic._id })}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin__section">
          <h2 className="admin__section-title">
            <span className="admin__dot admin__dot--approved" />
            Attendees ({attendees.length})
          </h2>
          <div className="admin__list">
            {[...attendees].reverse().map((a) => (
              <AttendeeRow
                key={a._id}
                id={a._id}
                name={a.name}
                role={a.role}
                interest={a.interest ?? ''}
                interestBucket={a.interestBucket}
                onSave={async (patch) => { await updateAttendee({ id: a._id, ...patch }); }}
                onDelete={() => {
                  if (confirm(`Delete ${a.name}?`)) deleteAttendee({ id: a._id });
                }}
              />
            ))}
            {attendees.length === 0 && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No attendees yet.</p>
            )}
          </div>
        </section>

        <section className="admin__section admin__section--danger">
          <h2 className="admin__section-title">
            <span className="admin__dot admin__dot--danger" />
            Reset Event ({attendees.length} attendees)
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            Wipe all attendees, topics, and votes to start fresh.
          </p>
          <button className="admin__btn admin__btn--reject" onClick={handleReset}>
            🗑️ Reset All Data
          </button>
        </section>
      </div>
    </div>
  );
}

function AttendeeRow({
  id,
  name,
  role,
  interest,
  interestBucket,
  onSave,
  onDelete,
}: {
  id: Id<'attendees'>;
  name: string;
  role: string;
  interest: string;
  interestBucket?: string;
  onSave: (patch: { name?: string; role?: string; interest?: string }) => void | Promise<void>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftRole, setDraftRole] = useState(role);
  const [draftInterest, setDraftInterest] = useState(interest);

  function save() {
    const patch: { name?: string; role?: string; interest?: string } = {};
    if (draftName !== name) patch.name = draftName;
    if (draftRole !== role) patch.role = draftRole;
    if (draftInterest !== interest) patch.interest = draftInterest;
    if (Object.keys(patch).length > 0) onSave(patch);
    setEditing(false);
  }

  function cancel() {
    setDraftName(name);
    setDraftRole(role);
    setDraftInterest(interest);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="admin__card" key={id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
        <input
          className="admin__input"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Name"
        />
        <input
          className="admin__input"
          value={draftRole}
          onChange={(e) => setDraftRole(e.target.value)}
          placeholder="Role"
        />
        <textarea
          className="admin__input"
          value={draftInterest}
          onChange={(e) => setDraftInterest(e.target.value)}
          placeholder="What do you want to talk about?"
          rows={2}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin__btn admin__btn--approve" onClick={save}>Save</button>
          <button className="admin__btn admin__btn--reject" onClick={cancel}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin__card" key={id}>
      <div className="admin__card-info">
        <span className="admin__card-text">
          <strong>{name}</strong>
          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{role}</span>
        </span>
        <span className="admin__card-meta">
          {interest ? <>“{interest}”</> : <em>no topic</em>}
          {interestBucket && (
            <span
              style={{
                marginLeft: 8,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: 'var(--claude-orange)',
              }}
            >
              · {interestBucket}
            </span>
          )}
        </span>
      </div>
      <div className="admin__card-actions">
        <button className="admin__btn admin__btn--approve" onClick={() => setEditing(true)}>
          ✏️ Edit
        </button>
        <button className="admin__btn admin__btn--reject" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
