import { useState, useEffect, useCallback } from 'react';
import { useEvent } from '../data/events/useEvent';
import type { EventConfig, TonightSlide, SlidePerson } from '../data/events';
import './EventSlides.css';

interface Props {
  onClose: () => void;
  /** Override the resolved event (e.g. for /prev archive views). */
  config?: EventConfig;
}

export function EventSlides({ onClose, config }: Props) {
  const resolved = useEvent();
  const cfg = config ?? resolved.config;
  const slides = cfg.tonightSlides ?? [{ kind: 'title' as const }];

  const [currentSlide, setCurrentSlide] = useState(0);

  const goNext = useCallback(() => {
    setCurrentSlide((p) => (p < slides.length - 1 ? p + 1 : p));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentSlide((p) => (p > 0 ? p - 1 : p));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose]);

  const slide = slides[currentSlide];

  return (
    <div className="es-overlay" onClick={onClose}>
      <div className="es-container" onClick={(e) => e.stopPropagation()}>
        <button className="es-close" onClick={onClose}>✕</button>

        <div className="es-progress">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`es-progress__dot ${i === currentSlide ? 'es-progress__dot--active' : ''} ${i < currentSlide ? 'es-progress__dot--done' : ''}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>

        <div className="es-slide-area">
          <button
            className="es-side-nav es-side-nav--prev"
            onClick={goPrev}
            disabled={currentSlide === 0}
            aria-label="Previous slide"
          >
            ‹
          </button>

          <div className={`es-slide es-slide--${slide.kind}`} key={currentSlide}>
            {renderSlide(slide, cfg)}
          </div>

          <button
            className="es-side-nav es-side-nav--next"
            onClick={currentSlide < slides.length - 1 ? goNext : onClose}
            aria-label={currentSlide < slides.length - 1 ? 'Next slide' : 'Close'}
          >
            ›
          </button>
        </div>

        <div className="es-counter">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
}

function renderSlide(slide: TonightSlide, cfg: EventConfig) {
  switch (slide.kind) {
    case 'title':
      return (
        <div className="es-title-splash">
          <div className="splash__content">
            <div className="splash__left">
              <p className="splash__date">{cfg.date}</p>
              <h2 className="splash__subtitle">{cfg.title}</h2>
              <h1 className="splash__city">{cfg.edition}</h1>
            </div>
            <div className="splash__right">
              <img src="/globe-braces.svg" alt="Globe" className="splash__globe-img" />
            </div>
          </div>
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
        </div>
      );

    case 'agenda':
      return (
        <div className="es-slide__text es-agenda-wrap">
          <h1 className="es-slide__title">{slide.title ?? 'Tonight'}</h1>
          <ul className="es-agenda">
            {slide.items.map((item, i) => (
              <li
                key={i}
                className="es-agenda__row"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {item.time && <span className="es-agenda__time">{item.time}</span>}
                <span className="es-agenda__labelwrap">
                  <span className="es-agenda__label">{item.label}</span>
                  {item.sub && <span className="es-agenda__sub">{item.sub}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'people':
      return (
        <div className="es-slide__text es-grid-wrap">
          <span className="es-slide__tag">{slide.tag}</span>
          <h1 className="es-slide__title">{slide.title}</h1>
          <div className="es-grid es-grid--people">
            {slide.people.map((p, i) => (
              <PersonCell key={i} person={p} index={i} />
            ))}
          </div>
        </div>
      );

    case 'demosCta':
      return (
        <div className="es-cta">
          <div className="es-cta__emoji">🎨</div>
          <h1 className="es-cta__title">{slide.title}</h1>
          <p className="es-cta__sub">{slide.subtitle}</p>
        </div>
      );

    case 'votePrizes':
      return (
        <div className="es-cta">
          <div className="es-cta__emoji">🏆</div>
          <h1 className="es-cta__title">{slide.title}</h1>
          <p className="es-cta__sub">{slide.subtitle}</p>
        </div>
      );

    case 'image':
      return (
        <div className="es-image-slide">
          <img src={slide.src} alt={slide.alt} className="es-image-slide__img" />
        </div>
      );

    case 'partner':
      return (
        <div className="es-partner">
          <div className="es-partner__main">
            <div className="es-partner__left">
              <div className="es-partner__brand">{slide.brand}</div>
              {slide.kicker && <p className="es-partner__kicker">{slide.kicker}</p>}
              <h1 className="es-partner__title">
                {slide.titleLines.map((l, i) => (
                  <span key={i} className={l.accent ? 'es-partner__accent' : undefined}>
                    {l.text}{' '}
                  </span>
                ))}
              </h1>
              {slide.subtitle && <p className="es-partner__sub">{slide.subtitle}</p>}
              {slide.stats && slide.stats.length > 0 && (
                <div className="es-partner__stats">
                  {slide.stats.map((s, i) => (
                    <div className="es-partner__stat" key={i}>
                      <span className="es-partner__stat-value">{s.value}</span>
                      <span className="es-partner__stat-label">{s.label}</span>
                      {s.sub && <span className="es-partner__stat-sub">{s.sub}</span>}
                    </div>
                  ))}
                </div>
              )}
              {slide.footer && <div className="es-partner__footer">{slide.footer}</div>}
            </div>
            {slide.qr && (
              <div className="es-partner__right">
                <div className="es-partner__qr">
                  <img src={slide.qr} alt="Scan" />
                </div>
                {slide.qrCaption && <p className="es-partner__qr-cap">{slide.qrCaption}</p>}
              </div>
            )}
          </div>
          {slide.partnerLogos && slide.partnerLogos.length > 0 && (
            <div className="es-partner__logos">
              <span className="es-partner__logos-label">Backed by</span>
              <div className="es-partner__logos-row">
                {slide.partnerLogos.map((l, i) => (
                  <img key={i} src={l.src} alt={l.alt} className="es-partner__logo" />
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'saveTheDate':
      return (
        <div className="es-std">
          <div className="es-std__kicker">Save the Date</div>
          <div className="es-std__date">{slide.date}</div>
          <h1 className="es-std__title">{slide.title}</h1>
          <p className="es-std__sub">{slide.subtitle}</p>
          <div className="es-std__sparkle">✨</div>
        </div>
      );
  }
}

function PersonCell({ person, index }: { person: SlidePerson; index: number }) {
  const initials = person.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="es-grid__cell" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="es-grid__photo-wrap">
        {person.photo ? (
          <img src={person.photo} alt={person.name} className="es-grid__photo" />
        ) : (
          <div className="es-grid__photo es-grid__photo--initials">{initials}</div>
        )}
      </div>
      <div className="es-grid__name">{person.name}</div>
      {person.role && <div className="es-grid__position">{person.role}</div>}
    </div>
  );
}
