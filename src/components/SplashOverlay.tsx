import './SplashOverlay.css';
import { useEvent } from '../data/events/useEvent';
import type { EventConfig } from '../data/events';

interface Props {
  onClose: () => void;
  /** Override the resolved event (e.g. for /prev archive views). */
  config?: EventConfig;
}

export function SplashOverlay({ onClose, config }: Props) {
  const resolved = useEvent();
  const cfg = config ?? resolved.config;

  return (
    <div className="splash" onClick={onClose}>
      <div className="splash__content">
        {/* Left side - text */}
        <div className="splash__left">
          <p className="splash__date">{cfg.date}</p>
          <h2 className="splash__subtitle">{cfg.title}</h2>
          <h1 className="splash__city">{cfg.edition}</h1>
        </div>

        {/* Right side - globe illustration */}
        <div className="splash__right">
          <img src="/globe-braces.svg" alt="Globe" className="splash__globe-img" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="splash__bottom">
        <div className="splash__hosted">
          <p>{cfg.hostedBy}</p>
        </div>
        <div className="splash__bottom-logos">
          {cfg.logos.map((logo) => (
            <div key={logo.url} className={`splash-logo-item ${logo.className}`}>
              <img src={logo.src} alt={logo.name || logo.className} className="splash-logo" />
              {logo.name && <span className="splash-logo__name">{logo.name}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="splash__hint">Click anywhere to continue</div>
    </div>
  );
}
