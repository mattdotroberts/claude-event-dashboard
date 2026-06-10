import { SPEAKERS, speakerSlug, type Speaker } from '../data/speakers';
import { useEvent } from '../data/events/useEvent';
import './Speakers.css';

export function Speakers() {
  const { config } = useEvent();
  const SPEAKERS_LIST = config.speakers ?? SPEAKERS;
  return (
    <div className="speakers-page">
      <div className="speakers-page__inner">
        <header className="speakers-page__header">
          <p className="speakers-page__kicker">Host notes</p>
          <h1 className="speakers-page__title">Speakers</h1>
          <p className="speakers-page__sub">{config.title} · {config.edition} · {config.date}</p>
        </header>

        {/* Index */}
        <nav className="speakers-toc" aria-label="Speaker index">
          <ol className="speakers-toc__list">
            {SPEAKERS_LIST.map((s, i) => (
              <li key={s.name} className="speakers-toc__item">
                <a href={`#${speakerSlug(s)}`} className="speakers-toc__link">
                  <span className="speakers-toc__num">{i + 1}.</span>
                  <span className="speakers-toc__name">{s.name}</span>
                  <span className="speakers-toc__role">{s.position}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Speaker sections */}
        {SPEAKERS_LIST.map((s, i) => (
          <SpeakerSection key={s.name} speaker={s} index={i + 1} />
        ))}

        <footer className="speakers-page__footer">
          <a href="/admin" className="speakers-page__back">← Back to admin</a>
        </footer>
      </div>
    </div>
  );
}

function SpeakerSection({ speaker, index }: { speaker: Speaker; index: number }) {
  const slug = speakerSlug(speaker);

  return (
    <section id={slug} className="speaker-section">
      <div className="speaker-section__head">
        <div className="speaker-section__photo-wrap">
          <img src={speaker.photo} alt={speaker.name} className="speaker-section__photo" />
        </div>
        <div className="speaker-section__meta">
          <p className="speaker-section__index">
            Speaker {index}{speaker.time ? ` · ${speaker.time}` : ''}
          </p>
          <h2 className="speaker-section__name">{speaker.name}</h2>
          <p className="speaker-section__position">{speaker.position}</p>
          <p className="speaker-section__talk">
            <span className="speaker-section__talk-label">Talk</span>
            {speaker.talkTitle}
          </p>
        </div>
      </div>

      {speaker.notes && speaker.notes.length > 0 && (
        <div className="speaker-section__block">
          <h3 className="speaker-section__block-title">Speaker notes</h3>
          <ul className="speaker-section__notes">
            {speaker.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {speaker.bio && (
        <div className="speaker-section__block">
          <h3 className="speaker-section__block-title">Bio (to read out)</h3>
          <p className="speaker-section__bio">{speaker.bio}</p>
        </div>
      )}

      {speaker.funFact && (
        <div className="speaker-section__block">
          <h3 className="speaker-section__block-title">Fun fact</h3>
          <p className="speaker-section__funfact">{speaker.funFact}</p>
        </div>
      )}

      <div className="speaker-section__block">
        <h3 className="speaker-section__block-title">Starter questions</h3>
        {(speaker.questions ?? []).length > 0 ? (
          <div className="speaker-section__qgroups">
            {speaker.questions!.map((g) => (
              <div className="speaker-section__qgroup" key={g.group}>
                <h4 className="speaker-section__qgroup-title">{g.group}</h4>
                <ul className="speaker-section__notes">
                  {g.items.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="speaker-section__empty">No questions yet.</p>
        )}
      </div>

      <a href="#top" className="speaker-section__back-to-top">↑ Back to top</a>
    </section>
  );
}
