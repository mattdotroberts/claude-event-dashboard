import './EventHeader.css';

const LOGOS = [
  {
    src: '/logo-claude.svg',
    name: '',
    url: 'https://claude.ai',
    className: 'header-logo--claude',
  },
  {
    src: '/logo-aisummit-full.svg',
    name: '',
    url: 'https://aisummitbarcelona.com',
    className: 'header-logo--aisummit',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/WTCB_Logo.svg',
    name: 'WTC Barcelona',
    url: 'https://www.wtcbarcelona.com',
    className: 'header-logo--wtcb',
  },
  {
    src: '/logo-happy-operators.png',
    name: 'Happy Operators',
    url: 'https://www.happyoperators.com/community',
    className: 'header-logo--hapi',
  },
];

interface Props {
  compact?: boolean;
  onTitleClick?: () => void;
  onWhatsUp?: () => void;
  onEventSlides?: () => void;
}

export function EventHeader({ compact = false, onTitleClick, onWhatsUp, onEventSlides }: Props) {
  return (
    <header className={`event-header ${compact ? 'event-header--compact' : ''}`}>
      <div className="event-header__left">
        <span className="event-header__date">14 May 2026</span>
        <span className="event-header__separator">·</span>
        <button
          className={`event-header__title ${onTitleClick ? 'event-header__title--clickable' : ''}`}
          onClick={onTitleClick}
        >
          Claude Code for Builders
        </button>
        <span className="event-header__edition">Barcelona #3</span>
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

export { LOGOS };
