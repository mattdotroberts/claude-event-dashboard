import './ProgressBar.css';

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  return (
    <div className="progress-bar">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`progress-bar__segment ${i < current ? 'progress-bar__segment--filled' : ''}`}
        />
      ))}
    </div>
  );
}
