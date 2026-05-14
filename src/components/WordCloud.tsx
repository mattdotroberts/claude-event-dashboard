import './WordCloud.css';

interface Bucket {
  bucket: string;
  count: number;
}

interface Props {
  buckets: Bucket[];
}

const COLORS = [
  'var(--claude-orange)',
  'var(--accent-blue)',
  'var(--accent-purple)',
  'var(--accent-green)',
  'var(--claude-peach)',
];

export function WordCloud({ buckets }: Props) {
  if (buckets.length === 0) {
    return (
      <div className="wc wc--empty">
        <p>Waiting for the room to tell us what they want to talk about…</p>
      </div>
    );
  }

  const max = Math.max(...buckets.map((b) => b.count));

  return (
    <div className="wc">
      {buckets.map((b, i) => {
        // Size scales between 22px and 96px based on share of max
        const ratio = b.count / max;
        const size = 22 + ratio * 74;
        const color = COLORS[i % COLORS.length];
        return (
          <span
            key={b.bucket}
            className="wc__item"
            style={{
              fontSize: `${size}px`,
              color,
              animationDelay: `${i * 0.04}s`,
            }}
          >
            {b.bucket}
            <span className="wc__count">{b.count}</span>
          </span>
        );
      })}
    </div>
  );
}
