import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { EventHeader } from '../components/EventHeader';
import './Admin.css';

export function Admin() {
  const topics = useQuery(api.topics.getAllTopicsWithVotes) ?? [];
  const attendees = useQuery(api.attendees.getAll) ?? [];
  const approveMutation = useMutation(api.topics.approveTopic);
  const rejectMutation = useMutation(api.topics.rejectTopic);
  const clearAttendees = useMutation(api.attendees.clearAll);
  const clearTopics = useMutation(api.topics.clearAll);

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
