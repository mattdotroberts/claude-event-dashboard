import { useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { EventHeader } from '../components/EventHeader';
import { useEvent } from '../data/events/useEvent';
import { getDeviceId, gradientFor, initials, seededShuffle } from '../lib/deviceId';
import './Demos.css';

const MAX_VOTES = 3;
type SortMode = 'random' | 'votes';

export function Demos() {
  const { config } = useEvent();
  const deviceId = getDeviceId();
  const data = useQuery(api.demos.getDemos, { deviceId });
  const voteDemo = useMutation(api.demos.voteDemo);
  const unvoteDemo = useMutation(api.demos.unvoteDemo);

  const [showSubmit, setShowSubmit] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('random');
  // One random seed per page load → stable shuffle that survives vote updates.
  const seedRef = useRef(Math.floor(Math.random() * 2 ** 31));

  const rawDemos = data?.demos ?? [];
  const myVotes = new Set(data?.myVotes ?? []);
  const votesLeft = data?.votesLeft ?? MAX_VOTES;

  // Default: fair random order (stable per session). Toggle: most votes first.
  const demos = useMemo(() => {
    if (sortMode === 'votes') {
      return [...rawDemos].sort((a, b) => b.voteCount - a.voteCount);
    }
    return seededShuffle(rawDemos, seedRef.current);
  }, [rawDemos, sortMode]);

  if (!config.demosEnabled) {
    return (
      <div className="demos">
        <EventHeader compact />
        <div className="demos__disabled">
          <span className="demos__disabled-emoji">🎨</span>
          <p>The demo directory isn't running for this event.</p>
        </div>
      </div>
    );
  }

  async function handleVote(demoId: Id<'demos'>, voted: boolean) {
    if (voted) {
      await unvoteDemo({ demoId, deviceId });
    } else {
      if (votesLeft <= 0) return;
      await voteDemo({ demoId, deviceId });
    }
  }

  return (
    <div className="demos">
      <EventHeader compact />

      <div className="demos__hero">
        <div className="demos__hero-left">
          <p className="demos__kicker">Community demos</p>
          <h1 className="demos__title">Show &amp; tell</h1>
          <p className="demos__sub">
            Projects from the room. Vote for the ones you love — you get{' '}
            <strong>{MAX_VOTES} votes</strong>.
          </p>
        </div>
        <div className="demos__hero-right">
          {rawDemos.length > 1 && (
            <div className="demos__sort" role="group" aria-label="Sort demos">
              <button
                className={`demos__sort-btn ${sortMode === 'random' ? 'is-active' : ''}`}
                onClick={() => setSortMode('random')}
              >
                🔀 Random
              </button>
              <button
                className={`demos__sort-btn ${sortMode === 'votes' ? 'is-active' : ''}`}
                onClick={() => setSortMode('votes')}
              >
                🏆 Most votes
              </button>
            </div>
          )}
          <div className="demos__votes-left">
            <span className="demos__votes-num">{votesLeft}</span>
            <span className="demos__votes-label">votes left</span>
          </div>
          <button className="demos__submit-btn" onClick={() => setShowSubmit(true)}>
            + Submit your project
          </button>
        </div>
      </div>

      {demos.length === 0 ? (
        <div className="demos__empty">
          <span className="demos__empty-emoji">✨</span>
          <h2>Be the first to share</h2>
          <p>No demos yet. Submit your project and get it on the board.</p>
          <button className="demos__submit-btn" onClick={() => setShowSubmit(true)}>
            + Submit your project
          </button>
        </div>
      ) : (
        <div className="demos__grid">
          {demos.map((d) => {
            const voted = myVotes.has(d._id);
            return (
              <DemoCard
                key={d._id}
                demo={d}
                voted={voted}
                canVote={voted || votesLeft > 0}
                onVote={() => handleVote(d._id, voted)}
              />
            );
          })}
        </div>
      )}

      {showSubmit && (
        <SubmitModal onClose={() => setShowSubmit(false)} />
      )}
    </div>
  );
}

type DemoShape = NonNullable<ReturnType<typeof useQuery<typeof api.demos.getDemos>>>['demos'][number];

function DemoCard({
  demo,
  voted,
  canVote,
  onVote,
}: {
  demo: DemoShape;
  voted: boolean;
  canVote: boolean;
  onVote: () => void;
}) {
  const title = demo.projectName || demo.ogTitle || 'Untitled';
  const sub = demo.tagline || demo.ogDescription || '';

  return (
    <div className="demo-card">
      <a className="demo-card__media" href={demo.projectUrl} target="_blank" rel="noopener noreferrer">
        {demo.imageUrl ? (
          <img src={demo.imageUrl} alt={title} className="demo-card__img" loading="lazy" />
        ) : (
          <div className="demo-card__fallback" style={{ background: gradientFor(title) }}>
            <span className="demo-card__fallback-text">{title}</span>
          </div>
        )}
        <span className="demo-card__open">↗</span>
      </a>

      <div className="demo-card__body">
        <h3 className="demo-card__name">
          {demo.faviconUrl && (
            <img src={demo.faviconUrl} alt="" className="demo-card__favicon" />
          )}
          {title}
        </h3>
        {sub && <p className="demo-card__tagline">{sub}</p>}

        <div className="demo-card__footer">
          <div className="demo-card__builder">
            {demo.avatarUrl ? (
              <img src={demo.avatarUrl} alt={demo.builderName} className="demo-card__avatar" />
            ) : (
              <span className="demo-card__avatar demo-card__avatar--initials">
                {initials(demo.builderName)}
              </span>
            )}
            <div className="demo-card__builder-meta">
              <span className="demo-card__builder-name">{demo.builderName}</span>
              {demo.linkedinUrl && (
                <a
                  className="demo-card__linkedin"
                  href={demo.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
              )}
            </div>
          </div>

          <button
            className={`demo-card__vote ${voted ? 'is-voted' : ''}`}
            onClick={onVote}
            disabled={!canVote}
            aria-pressed={voted}
            title={!canVote ? 'No votes left' : voted ? 'Remove vote' : 'Vote'}
          >
            <span className="demo-card__vote-heart">{voted ? '♥' : '♡'}</span>
            <span className="demo-card__vote-count">{demo.voteCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmitModal({ onClose }: { onClose: () => void }) {
  const submitDemo = useMutation(api.demos.submitDemo);
  const generateUploadUrl = useMutation(api.demos.generateUploadUrl);

  const [builderName, setBuilderName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [tagline, setTagline] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    builderName.trim() && email.trim() && projectName.trim() && projectUrl.trim();

  function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    try {
      setAvatarPreview(URL.createObjectURL(file));
    } catch {}
  }

  function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    try {
      setCoverPreview(URL.createObjectURL(file));
    } catch {}
  }

  async function uploadFile(file: File | null): Promise<Id<'_storage'> | undefined> {
    if (!file) return undefined;
    const url = await generateUploadUrl({});
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) throw new Error('upload failed');
    const { storageId } = await res.json();
    return storageId as Id<'_storage'>;
  }

  async function handleSubmit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const avatarStorageId = await uploadFile(avatarFile);
      const imageStorageId = await uploadFile(coverFile);
      await submitDemo({
        builderName: builderName.trim(),
        email: email.trim(),
        linkedinUrl: linkedinUrl.trim() || undefined,
        projectName: projectName.trim(),
        tagline: tagline.trim() || undefined,
        projectUrl: projectUrl.trim(),
        avatarStorageId,
        imageStorageId,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again?');
      setSubmitting(false);
    }
  }

  return (
    <div className="demos-modal" onClick={onClose}>
      <div className="demos-modal__card" onClick={(e) => e.stopPropagation()}>
        <button className="demos-modal__close" onClick={onClose}>✕</button>
        <h2 className="demos-modal__title">Submit your project</h2>
        <p className="demos-modal__sub">
          Paste a link and we'll pull in a preview image automatically.
        </p>

        <div className="demos-modal__avatar-row">
          <label className="demos-modal__avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="You" />
            ) : (
              <span className="demos-modal__avatar-initials">
                {builderName ? initials(builderName) : '📷'}
              </span>
            )}
            <input type="file" accept="image/*" onChange={onAvatar} hidden />
            <span className="demos-modal__avatar-edit">Photo</span>
          </label>
          <div className="demos-modal__avatar-fields">
            <Field label="Your name *">
              <input value={builderName} onChange={(e) => setBuilderName(e.target.value)} placeholder="Jane Doe" />
            </Field>
            <Field label="LinkedIn URL">
              <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/…" />
            </Field>
          </div>
        </div>

        <Field label="Email * (private — for prizes only)">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </Field>

        <div className="demos-modal__divider">The project</div>

        <Field label="Project name *">
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My amazing thing" />
        </Field>
        <Field label="Project link *">
          <input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="myproject.com" />
        </Field>
        <Field label="Tagline">
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One line about it" maxLength={120} />
        </Field>

        <label className="demos-field__label" style={{ marginTop: 4 }}>Cover image (optional)</label>
        <label className="demos-modal__cover">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="demos-modal__cover-img" />
          ) : (
            <span className="demos-modal__cover-hint">
              📷 Upload a cover, or we'll pull one from your link
            </span>
          )}
          <input type="file" accept="image/*" onChange={onCover} hidden />
        </label>

        {error && <p className="demos-modal__error">{error}</p>}

        <button
          className="demos-modal__submit"
          onClick={handleSubmit}
          disabled={!valid || submitting}
        >
          {submitting ? 'Submitting…' : 'Add to the board →'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="demos-field">
      <span className="demos-field__label">{label}</span>
      {children}
    </label>
  );
}
