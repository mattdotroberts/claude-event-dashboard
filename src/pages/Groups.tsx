import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { EventHeader } from '../components/EventHeader';
import './Groups.css';

const GROUP_COLORS = [
  'var(--claude-orange)',
  'var(--accent-blue)',
  'var(--accent-purple)',
  'var(--accent-green)',
  'var(--claude-peach)',
];

export function Groups() {
  const topics = useQuery(api.topics.getTopicsWithVotes, {}) ?? [];
  const topTopics = topics.slice(0, 5);

  return (
    <div className="groups">
      <EventHeader />
      <div className="groups__header">
        <h1 className="groups__title">Discussion Groups</h1>
        <p className="groups__subtitle">Find your topic below. Head to your group!</p>
      </div>
      <div className="groups__grid">
        {topTopics.map((topic, i) => (
          <GroupCard
            key={topic._id}
            groupNumber={i + 1}
            topicId={topic._id}
            emoji={topic.emoji}
            text={topic.text}
            voteCount={topic.voteCount}
            color={GROUP_COLORS[i % GROUP_COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
}

function GroupCard({ groupNumber, topicId, emoji, text, voteCount, color }: {
  groupNumber: number;
  topicId: Id<"topics">;
  emoji?: string;
  text: string;
  voteCount: number;
  color: string;
}) {
  const attendees = useQuery(api.topics.getAttendeesForTopic, { topicId }) ?? [];

  return (
    <div className="group-card" style={{ borderColor: color }}>
      <div className="group-card__header">
        <span className="group-card__number" style={{ background: color }}>Group {groupNumber}</span>
        <span className="group-card__count">{voteCount} votes</span>
      </div>
      <h2 className="group-card__topic">
        {emoji && <span>{emoji} </span>}
        {text}
      </h2>
      <div className="group-card__attendees">
        {attendees.map((a) => a && (
          <div className="group-card__person" key={a._id}>
            <span className="group-card__name">{a.name}</span>
            <span className="group-card__role">{a.role}</span>
          </div>
        ))}
        {attendees.length === 0 && (
          <p className="group-card__empty">No votes yet</p>
        )}
      </div>
    </div>
  );
}
