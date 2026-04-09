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
    url: 'https://www.happyoperators.com',
    className: 'header-logo--hapi',
  },
];

interface Props {
  compact?: boolean;
  onTitleClick?: () => void;
  onWhatsUp?: () => void;
}

export function EventHeader({ compact = false, onTitleClick, onWhatsUp }: Props) {
  return (
    <header className={`event-header ${compact ? 'event-header--compact' : ''}`}>
      <div className="event-header__left">
        <span className="event-header__date">9 April 2026</span>
        <span className="event-header__separator">·</span>
        <button
          className={`event-header__title ${onTitleClick ? 'event-header__title--clickable' : ''}`}
          onClick={onTitleClick}
        >
          Claude for Everyone
        </button>
        <span className="event-header__edition">Barcelona #2</span>
        {onWhatsUp && (
          <button className="event-header__whatsup" onClick={onWhatsUp}>
            What's up Claude?
          </button>
        )}
      </div>
      <div className="event-header__logos">
        {LOGOS.map((logo) => (
          <div key={logo.url} className={`header-logo-item ${logo.className}`}>
            <img src={logo.src} alt={logo.name || logo.className} className="header-logo__icon" />
            {logo.name && <span className="header-logo__name">{logo.name}</span>}
          </div>
        ))}
      </div>
    </header>
  );
}

export { LOGOS };
