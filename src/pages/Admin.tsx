import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { EventHeader } from '../components/EventHeader';
import './Admin.css';

export function Admin() {
  const topics = useQuery(api.topics.getAllTopicsWithVotes) ?? [];
  const attendees = useQuery(api.attendees.getAll) ?? [];
  const approveMutation = useMutation(api.topics.approveTopic);
  const rejectMutation = useMutation(api.topics.rejectTopic);
  const clearAttendees = useMutation(api.attendees.clearAll);
  const clearTopics = useMutation(api.topics.clearAll);
  const updateAttendee = useMutation(api.attendees.updateAttendeeAsAdmin);
  const deleteAttendee = useMutation(api.attendees.deleteAttendee);

  const pending = topics.filter((t) => !t.approved);
  const approved = topics.filter((t) => t.approved);

  async function handleReset() {
    if (!confirm('⚠️ This will delete ALL attendees, topics, and votes. Are you sure?')) return;
    await clearAttendees();
    await clearTopics();
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
        </section>


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
