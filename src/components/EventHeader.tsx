import './EventHeader.css';
import { useEvent } from '../data/events/useEvent';
import type { EventConfig } from '../data/events';

interface Props {
  compact?: boolean;
  onTitleClick?: () => void;
  onWhatsUp?: () => void;
  onEventSlides?: () => void;
  /** Override the resolved event (e.g. for /prev/<slug> archive views). */
  config?: EventConfig;
}

export function EventHeader({ compact = false, onTitleClick, onWhatsUp, onEventSlides, config }: Props) {
  const resolved = useEvent();
  const cfg = config ?? resolved.config;
  const LOGOS = cfg.logos;
  return (
    <header className={`event-header ${compact ? 'event-header--compact' : ''}`}>
      <div className="event-header__left">
        <span className="event-header__date">{cfg.date}</span>
        <span className="event-header__separator">·</span>
        <button
          className={`event-header__title ${onTitleClick ? 'event-header__title--clickable' : ''}`}
          onClick={onTitleClick}
        >
          {cfg.title}
        </button>
        <span className="event-header__edition">{cfg.edition}</span>
        {onWhatsUp && (
          <button className="event-header__whatsup" onClick={onWhatsUp}>
            What's up Claude?
          </button>
        )}
        {onEventSlides && (
          <button className="event-header__whatsup" onClick={onEventSlides}>
            Tonight
          </button>
        )}
      </div>
      <div className="event-header__logos">
        {LOGOS.map((logo) => (
          <a key={logo.url} href={logo.url} target="_blank" rel="noopener noreferrer" className={`header-logo-item ${logo.className}`}>
            <img src={logo.src} alt={logo.name || logo.className} className="header-logo__icon" />
            {logo.name && <span className="header-logo__name">{logo.name}</span>}
          </a>
        ))}
      </div>
    </header>
  );
}
