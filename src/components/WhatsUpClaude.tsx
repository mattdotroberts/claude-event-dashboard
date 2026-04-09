import { useState, useEffect, useCallback } from 'react';
import './WhatsUpClaude.css';

interface Slide {
  tag?: string;
  title: string;
  body: string[];
  image?: string;
}

const SLIDES: Slide[] = [
  {
    title: "What's new in Claude",
    body: ["The last 4 weeks, in 5 minutes."],
  },
  {
    tag: 'April 8',
    title: 'Managed Agents',
    image: '/slide-managed-agents.png',
    body: [
      'Claude now runs agents for you.',
      'Managed Agents launched yesterday in public beta. You build the agent, Anthropic runs the infrastructure. File reading, code execution, web browsing — all handled.',
      'What used to take months to deploy now takes days.',
      'Early adopters: Notion, Rakuten, Asana.',
      'Pricing: model usage + 8 cents per agent runtime hour.',
      'Think of it like serverless, but for AI agents. You write the logic, someone else worries about the servers.',
    ],
  },
  {
    tag: 'April 7',
    title: 'Mythos Preview',
    body: [
      'Claude Mythos: a model built for security.',
      'Two days ago, Anthropic released Mythos in a gated research preview. It has already discovered thousands of zero-day vulnerabilities across major operating systems and browsers.',
      'Access is invitation-only through Project Glasswing.',
      'Partners include AWS, Apple, Google, Microsoft, NVIDIA, and JPMorgan Chase.',
      'Anthropic committed $100m in credits and $4m to open-source security organisations.',
      'This is not a chatbot upgrade. It is a new category of model, purpose-built to find the bugs before someone else does.',
    ],
  },
  {
    tag: 'March 23',
    title: 'Computer Use in Claude Code & Cowork',
    image: '/slide-computer-use.png',
    body: [
      'Claude can now see and control your screen.',
      'Computer Use shipped for Pro and Max users on macOS. No setup. Claude opens files, clicks buttons, navigates apps, runs dev tools.',
      'This is the feature that makes "beyond coding" real. Claude is no longer just a text box. It is a colleague who can see what you see.',
      'Imagine asking Claude to "open Figma, export the assets, and drop them in the right folder." That is what this enables.',
    ],
  },
  {
    tag: 'March 17',
    title: 'Dispatch',
    image: '/slide-dispatch.png',
    body: [
      'Control your desktop from your phone.',
      'Dispatch gives you one persistent conversation thread across mobile and desktop. Start a task on your phone, Claude executes it on your computer.',
      'Rolled out to Max plan subscribers first, Pro following.',
      'You are on the metro home. You realise you forgot to resize those images. You text Claude from your phone. Done by the time you walk through the door.',
    ],
  },
];

interface Props {
  onClose: () => void;
}

export function WhatsUpClaude({ onClose }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const goNext = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection('next');
      setCurrentSlide((p) => p + 1);
    }
  }, [currentSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection('prev');
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

  const slide = SLIDES[currentSlide];
  const isTitle = currentSlide === 0;
  const hasImage = !!slide.image;

  return (
    <div className="wuc-overlay" onClick={onClose}>
      <div className="wuc-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="wuc-close" onClick={onClose}>✕</button>

        {/* Progress bar */}
        <div className="wuc-progress">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`wuc-progress__dot ${i === currentSlide ? 'wuc-progress__dot--active' : ''} ${i < currentSlide ? 'wuc-progress__dot--done' : ''}`}
              onClick={() => { setDirection(i > currentSlide ? 'next' : 'prev'); setCurrentSlide(i); }}
            />
          ))}
        </div>

        {/* Slide area with side nav */}
        <div className="wuc-slide-area">
          {/* Prev button */}
          <button
            className="wuc-side-nav wuc-side-nav--prev"
            onClick={goPrev}
            disabled={currentSlide === 0}
            aria-label="Previous slide"
          >
            ‹
          </button>

          {/* Slide content */}
          <div className={`wuc-slide ${isTitle ? 'wuc-slide--title' : ''} ${hasImage ? 'wuc-slide--with-image' : ''}`} key={currentSlide}>
            <div className="wuc-slide__text">
              {slide.tag && (
                <span className="wuc-slide__tag">{slide.tag}</span>
              )}
              <h1 className={`wuc-slide__title ${isTitle ? 'wuc-slide__title--hero' : ''}`}>
                {slide.title}
              </h1>
              <div className="wuc-slide__body">
                {slide.body.map((line, i) => (
                  <p
                    key={i}
                    className={`wuc-slide__line ${i === 0 && !isTitle ? 'wuc-slide__line--lead' : ''}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            {hasImage && (
              <div className="wuc-slide__image-wrap" onClick={() => setLightbox(slide.image!)}>
                <img src={slide.image} alt={slide.title} className="wuc-slide__image" />
              </div>
            )}
          </div>

          {/* Next button */}
          <button
            className="wuc-side-nav wuc-side-nav--next"
            onClick={currentSlide < SLIDES.length - 1 ? goNext : onClose}
            aria-label={currentSlide < SLIDES.length - 1 ? 'Next slide' : 'Close'}
          >
            ›
          </button>
        </div>

        {/* Counter */}
        <div className="wuc-counter">
          {currentSlide + 1} / {SLIDES.length}
        </div>

        {/* Image lightbox */}
        {lightbox && (
          <div className="wuc-lightbox" onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="Full screen" className="wuc-lightbox__img" />
          </div>
        )}
      </div>
    </div>
  );
}
