import { useState, useEffect, useCallback } from 'react';
import { SPEAKERS, type Speaker } from '../data/speakers';
import './EventSlides.css';

type EventSlide =
  | {
      kind: 'title';
      date: string;
      subtitle: string;
      city: string;
    }
  | { kind: 'agenda'; title: string; items: { time?: string; label: string }[] }
  | { kind: 'speakerGrid'; title: string; speakers: Speaker[] }
  | { kind: 'speaker'; talkTitle: string; speaker: Speaker }
  | { kind: 'fullBleed'; image: string; alt: string }
  | { kind: 'credits' };

const SPLASH_LOGOS = [
  { src: '/logo-claude.svg', alt: 'Claude', className: 'splash-logo--claude' },
  { src: '/logo-aisummit-full.svg', alt: 'AI Summit Barcelona', className: 'splash-logo--aisummit' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/WTCB_Logo.svg', alt: 'WTC Barcelona', className: 'splash-logo--wtcb' },
  { src: '/logo-happy-operators.png', alt: 'Happy Operators', className: 'splash-logo--hapi', showName: true },
];

const EVENT_SLIDES: EventSlide[] = [
  {
    kind: 'title',
    date: '14 May 2026',
    subtitle: 'Claude Code for Builders #3',
    city: 'Barcelona',
  },
  {
    kind: 'agenda',
    title: 'Agenda',
    items: [
      { time: '6.20pm', label: 'Opening Remarks' },
      { time: '6.25pm', label: 'AI Summit giveaway 🎁' },
      { time: '6.30pm', label: 'Community Talks' },
      { time: '7.50pm', label: 'Anthropic giveaway 🎁' },
      { time: '7.55pm', label: 'Next event preview 📣' },
      { time: '8.00pm', label: 'Cheese, Wine and Razzamatazzing' },
    ],
  },
  {
    kind: 'speakerGrid',
    title: 'Speakers',
    speakers: SPEAKERS,
  },
  ...SPEAKERS.map<EventSlide>((s) => ({
    kind: 'speaker' as const,
    talkTitle: s.talkTitle,
    speaker: s,
  })),
  { kind: 'credits' },
];

interface Props {
  onClose: () => void;
}

export function EventSlides({ onClose }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const goNext = useCallback(() => {
    if (currentSlide < EVENT_SLIDES.length - 1) {
      setCurrentSlide((p) => p + 1);
    }
  }, [currentSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((p) => p - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightbox) {
        if (e.key === 'Escape') setLightbox(null);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose, lightbox]);

  const slide = EVENT_SLIDES[currentSlide];

  return (
    <div className="es-overlay" onClick={onClose}>
      <div className="es-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="es-close" onClick={onClose}>✕</button>

        {/* Progress bar */}
        <div className="es-progress">
          {EVENT_SLIDES.map((_, i) => (
            <div
              key={i}
              className={`es-progress__dot ${i === currentSlide ? 'es-progress__dot--active' : ''} ${i < currentSlide ? 'es-progress__dot--done' : ''}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>

        {/* Slide area with side nav */}
        <div className="es-slide-area">
          <button
            className="es-side-nav es-side-nav--prev"
            onClick={goPrev}
            disabled={currentSlide === 0}
            aria-label="Previous slide"
          >
            ‹
          </button>

          {/* Slide content */}
          <div className={`es-slide es-slide--${slide.kind}`} key={currentSlide}>
            {renderSlide(slide, setLightbox)}
          </div>

          <button
            className="es-side-nav es-side-nav--next"
            onClick={currentSlide < EVENT_SLIDES.length - 1 ? goNext : onClose}
            aria-label={currentSlide < EVENT_SLIDES.length - 1 ? 'Next slide' : 'Close'}
          >
            ›
          </button>
        </div>

        {/* Counter */}
        <div className="es-counter">
          {currentSlide + 1} / {EVENT_SLIDES.length}
        </div>

        {/* Image lightbox */}
        {lightbox && (
          <div className="es-lightbox" onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="Full screen" className="es-lightbox__img" />
          </div>
        )}
      </div>
    </div>
  );
}

function renderSlide(slide: EventSlide, openLightbox: (src: string) => void) {
  switch (slide.kind) {
    case 'title':
      return (
        <div className="es-title-splash">
          <div className="splash__content">
            <div className="splash__left">
              <p className="splash__date">{slide.date}</p>
              <h2 className="splash__subtitle">{slide.subtitle}</h2>
              <h1 className="splash__city">{slide.city}</h1>
            </div>
            <div className="splash__right">
              <img src="/globe-braces.svg" alt="Globe" className="splash__globe-img" />
            </div>
          </div>
          <div className="splash__bottom">
            <div className="splash__hosted">
              <p>Hosted by AI Summit Barcelona, WTC Barcelona</p>
              <p>& Happy Operators</p>
            </div>
            <div className="splash__bottom-logos">
              {SPLASH_LOGOS.map((logo) => (
                <div key={logo.alt} className={`splash-logo-item ${logo.className}`}>
                  <img src={logo.src} alt={logo.alt} className="splash-logo" />
                  {'showName' in logo && logo.showName && (
                    <span className="splash-logo__name">{logo.alt}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'agenda':
      return (
        <div className="es-slide__text es-agenda-wrap">
          <h1 className="es-slide__title">{slide.title}</h1>
          <ul className="es-agenda">
            {slide.items.map((item, i) => (
              <li
                key={i}
                className="es-agenda__row"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {item.time && <span className="es-agenda__time">{item.time}</span>}
                <span className="es-agenda__label">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'speakerGrid':
      return (
        <div className="es-slide__text es-grid-wrap">
          <h1 className="es-slide__title">{slide.title}</h1>
          <div className="es-grid">
            {slide.speakers.map((s, i) => (
              <div
                key={i}
                className="es-grid__cell"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => openLightbox(s.photo)}
              >
                <div className="es-grid__photo-wrap">
                  <img src={s.photo} alt={s.name} className="es-grid__photo" />
                </div>
                <div className="es-grid__name">{s.name}</div>
                <div className="es-grid__position">{s.position}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'speaker':
      return (
        <>
          <div className="es-slide__text">
            <span className="es-slide__tag">Speaker</span>
            <h1 className="es-slide__title">{slide.talkTitle}</h1>
            <div className="es-speaker__meta">
              <div className="es-speaker__name">{slide.speaker.name}</div>
              <div className="es-speaker__position">{slide.speaker.position}</div>
            </div>
          </div>
          <div
            className="es-speaker__photo-wrap"
            onClick={() => openLightbox(slide.speaker.photo)}
          >
            <img
              src={slide.speaker.photo}
              alt={slide.speaker.name}
              className="es-speaker__photo"
            />
          </div>
        </>
      );

    case 'fullBleed':
      return (
        <div
          className="es-fullbleed"
          onClick={() => openLightbox(slide.image)}
        >
          <img src={slide.image} alt={slide.alt} className="es-fullbleed__img" />
        </div>
      );

    case 'credits':
      return (
        <div className="es-credits-wrap">
          <div className="credits-card credits-card--in-deck">
            <div className="credits-card__left">
              <div className="credits-card__party">🎉</div>
              <h2 className="credits-card__title">
                Claude for Builders<br />in Barcelona
              </h2>
              <p className="credits-card__sub">
                Sign up by May 20th to get $20 in free API credits to build with Claude.
              </p>
            </div>
            <div className="credits-card__right">
              <img src="/credits-qr.png" alt="Scan to redeem" className="credits-card__qr" />
            </div>
            <div className="credits-card__logo">
              <img src="/logo-claude.svg" alt="Claude" />
            </div>
          </div>
        </div>
      );
  }
}
