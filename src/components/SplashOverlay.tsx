import './SplashOverlay.css';

interface Props {
  onClose: () => void;
}

const LOGOS = [
  { src: '/logo-claude.svg', alt: 'Claude', className: 'splash-logo--claude' },
  { src: '/logo-aisummit-full.svg', alt: 'AI Summit Barcelona', className: 'splash-logo--aisummit' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/WTCB_Logo.svg', alt: 'WTC Barcelona', className: 'splash-logo--wtcb' },
  { src: '/logo-happy-operators.png', alt: 'Happy Operators', className: 'splash-logo--hapi', showName: true },
];

export function SplashOverlay({ onClose }: Props) {
  return (
    <div className="splash" onClick={onClose}>
      <div className="splash__content">
        {/* Left side - text */}
        <div className="splash__left">
          <p className="splash__date">14 May 2026</p>
          <h2 className="splash__subtitle">Claude Code for Builders #3</h2>
          <h1 className="splash__city">Barcelona</h1>
        </div>

        {/* Right side - globe illustration */}
        <div className="splash__right">
          <img src="/globe-braces.svg" alt="Globe" className="splash__globe-img" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="splash__bottom">
        <div className="splash__hosted">
          <p>Hosted by AI Summit Barcelona, WTC Barcelona</p>
          <p>& Happy Operators</p>
        </div>
        <div className="splash__bottom-logos">
          {LOGOS.map((logo) => (
            <div key={logo.alt} className={`splash-logo-item ${logo.className}`}>
              <img src={logo.src} alt={logo.alt} className="splash-logo" />
              {'showName' in logo && logo.showName && (
                <span className="splash-logo__name">{logo.alt}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="splash__hint">Click anywhere to continue</div>
    </div>
  );
}
