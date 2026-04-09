import './ClaudeCharacter.css';

interface Props {
  size?: 'small' | 'medium' | 'large';
  walking?: boolean;
}

export function ClaudeCharacter({ size = 'medium', walking = false }: Props) {
  const cls = `claude-char claude-char--${size} ${walking ? 'claude-char--walking' : 'claude-char--floating'}`;
  return (
    <div className={cls}>
      <div className="claude-char__ear claude-char__ear--left" />
      <div className="claude-char__ear claude-char__ear--right" />
      <div className="claude-char__body">
        <div className="claude-char__eyes" />
      </div>
      <div className="claude-char__legs">
        <div className="claude-char__leg claude-char__leg--1" />
        <div className="claude-char__leg claude-char__leg--2" />
        <div className="claude-char__leg claude-char__leg--3" />
        <div className="claude-char__leg claude-char__leg--4" />
      </div>
    </div>
  );
}
